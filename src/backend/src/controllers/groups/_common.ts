import type express from 'express';
import { prisma } from '../../app';
import { error, info, notifs, notify, sendMsg } from '../../tools/translator';
import properties from '../../properties';
import sanitizer from '../../tools/sanitizer';

/**
 * Delete a group
 * The response will be sent by the function
 * @param req Express request
 * @param res Express response
 * @param asAdmin Weather to update as an admin or not
 */
function deleteGroup (req: express.Request, res: express.Response, asAdmin: boolean) {
    const groupId = sanitizer.id(req.params.id, true, req, res);
    if (groupId === null) return;

    prisma.group.findUnique({ where: { id: groupId } })
        .then((group) => {
            if (group === null) {
                sendMsg(req, res, error.group.notFound);
                return;
            }
            if (!asAdmin) {
                if (group.creatorId !== res.locals.user.id) {
                    sendMsg(req, res, error.group.notCreator);
                    return;
                }
            }
            prisma.travel.updateMany({
                where: {
                    groupId
                },
                data: { status: properties.travel.status.cancelled }
            }).then(() => {
                prisma.group.delete({
                    where: { id: groupId },
                    include: {
                        users: true
                    }
                }).then((group) => {
                    const data = group.users.map((user) => {
                        const notif = notifs.group.deleted(user, group, res.locals.user, asAdmin);
                        return {
                            ...notif,
                            userId: user.id,
                            senderId: Number(res.locals.user.id)
                        };
                    });

                    // create notifications
                    prisma.notification.createMany({ data }).then(() => {
                        for (const notif of data) {
                            const user = group.users.find((user) => user.id === notif.userId);
                            // send email notification
                            if (user !== undefined) notify(user, notif);
                        }
                        sendMsg(req, res, info.group.deleted);
                    }).catch((err) => {
                        console.error(err);
                        sendMsg(req, res, error.generic.internalError);
                    });
                }).catch((err) => {
                    console.error(err);
                    sendMsg(req, res, error.generic.internalError);
                });
            }).catch((err) => {
                console.error(err);
                sendMsg(req, res, error.generic.internalError);
            });
        }).catch((err) => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
}

export { deleteGroup };
