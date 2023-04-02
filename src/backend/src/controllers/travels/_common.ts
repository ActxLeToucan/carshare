import type express from 'express';
import validator from '../../tools/validator';
import { prisma } from '../../app';
import { error, info, notifs, notify, sendMsg } from '../../tools/translator';
import { getMaxPassengers } from '../_common';
import { type Booking, type Step } from '@prisma/client';
import properties from '../../properties';
import sanitizer from '../../tools/sanitizer';

/**
 * Update a travel
 * The response will be sent by the function
 * @param req Express request
 * @param res Express response
 * @param asAdmin Weather to update as an admin or not
 */
async function update (req: express.Request, res: express.Response, asAdmin: boolean) {
    const travelId = sanitizer.id(req.params.id, req, res);
    if (travelId === null) return;

    const { maxPassengers, price, description, steps } = req.body;

    if (maxPassengers !== undefined && !validator.maxPassengers(maxPassengers, true, req, res)) return;
    if (price !== undefined && !validator.price(price, true, req, res)) return;
    if (description !== undefined && !validator.description(description, true, req, res)) return;

    if (!validator.checkStepList(steps, true, req, res)) return;

    // Check if the travel exists
    const travel = await prisma.travel.findUnique({
        where: { id: travelId },
        include: {
            steps: {
                orderBy: { date: 'asc' }
            }
        }
    });
    if (travel === null) {
        sendMsg(req, res, error.travel.notFound);
        return;
    }

    if (!asAdmin && travel.driverId !== res.locals.user.id) {
        sendMsg(req, res, error.travel.notDriver);
        return;
    }

    if (travel.status !== properties.travel.status.open) {
        sendMsg(req, res, error.travel.notOpen);
        return;
    }

    // Check if the travel is editable
    const firstStep = travel.steps.at(0);
    if (firstStep !== undefined && !validator.checkTravelHours(firstStep.date)) {
        sendMsg(req, res, error.travel.notModifiable);
        return;
    }

    // Check number of passengers <= new maxPassengers
    if (firstStep !== undefined) {
        const count: any = await getMaxPassengers(travel.id, firstStep, travel.steps[travel.steps.length - 1]);
        const passengers = Number(count[0].nbPassengers);
        if (Number.isNaN(passengers)) {
            console.error('Error while getting the number of passengers in the trip');
            sendMsg(req, res, error.generic.internalError);
            return;
        }

        if (passengers > maxPassengers) {
            sendMsg(req, res, error.travel.tooManyPassengers);
            return;
        }
    }

    // Check if the steps with id are valid
    const stepsToUpdate = steps.filter((s: any) => s.id !== undefined);
    for (const step of stepsToUpdate) {
        if (steps.findIndex((s: Step) => s.id === step.id) === -1) {
            sendMsg(req, res, error.travel.invalidSteps);
            return;
        }
    }

    // Check if there is no other travel at the same time
    const travelsSteps = await prisma.travel.findMany({
        where: {
            driverId: res.locals.user.id,
            status: properties.travel.status.open,
            id: { not: travel.id }
        },
        select: {
            steps: {
                select: { date: true },
                orderBy: { date: 'asc' }
            }
        }
    });
    for (const travelSteps of travelsSteps) {
        if (!validator.checkTravelAlready(steps[0].date, steps[steps.length - 1].date, travelSteps.steps, true, req, res)) return;
    }

    // Get bookings for notifications (before any update to preserve the old data)
    const bookings = await prisma.booking.findMany({
        where: {
            departure: { travelId }
        },
        include: {
            departure: true,
            arrival: true,
            passenger: true
        }
    });

    // Update steps with id
    for (const stepToUpdate of stepsToUpdate) {
        await prisma.step.update({
            where: { id: stepToUpdate.id },
            data: {
                date: stepToUpdate.date,
                label: stepToUpdate.label,
                city: stepToUpdate.city,
                context: stepToUpdate.context,
                lat: stepToUpdate.lat,
                lng: stepToUpdate.lng
            }
        });
    }

    // Create new steps
    const stepsToCreate = steps.filter((s: any) => s.id === undefined);
    const stepsToCreateData = stepsToCreate.map((s: any) => ({
        date: s.date,
        label: s.label,
        city: s.city,
        context: s.context,
        lat: s.lat,
        lng: s.lng,
        travelId: travel.id
    }));
    await prisma.step.createMany({ data: stepsToCreateData });

    // Delete steps that are not in the list
    const stepsToDelete = travel.steps.filter((s: Step) => steps.findIndex((step: any) => step.id === s.id) === -1);
    await prisma.step.deleteMany({ where: { id: { in: stepsToDelete.map((s: Step) => s.id) } } });

    // Update travel
    const updatedTravel = await prisma.travel.update({
        where: { id: travelId },
        data: {
            maxPassengers,
            price,
            description
        },
        include: {
            steps: {
                orderBy: { date: 'asc' }
            },
            driver: true
        }
    });

    // Create notifications for passengers
    const data = bookings
        .filter(booking => booking.status === properties.booking.status.pending || booking.status === properties.booking.status.accepted)
        .map((booking) => {
            const bookingDeleted = stepsToDelete.map((s: Step) => s.id).includes(booking.departure.id) || stepsToDelete.map((s: Step) => s.id).includes(booking.arrival.id);
            const notif = bookingDeleted
                ? notifs.booking.deletedDueToTravelUpdate(booking.passenger, booking, updatedTravel, asAdmin)
                : notifs.booking.travelUpdated(booking.passenger, booking, asAdmin);
            return {
                ...notif,
                userId: booking.passenger.id,
                senderId: Number(res.locals.user.id),
                travelId: updatedTravel.id,
                bookingId: bookingDeleted ? undefined : booking.id
            }
        });

    await prisma.notification.createMany({ data });
    for (const notif of data) {
        const booking = bookings.find((b: Booking) => b.id === notif.bookingId);
        // Send email notification
        if (booking !== undefined) notify(booking.passenger, notif);
    }

    // Create notifications for driver
    if (asAdmin) {
        const notif = notifs.travel.updated(updatedTravel.driver, updatedTravel);
        await prisma.notification.create({
            data: {
                ...notif,
                userId: updatedTravel.driver.id,
                senderId: Number(res.locals.user.id),
                travelId: updatedTravel.id
            }
        });
        // Send email notification
        notify(updatedTravel.driver, notif);
    }

    sendMsg(req, res, info.travel.updated, updatedTravel);
}

export { update };
