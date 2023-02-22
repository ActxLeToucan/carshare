import nodemailer from 'nodemailer';
import mailConfig from '../../mail.config.json';
import { type Mail } from './translator';

let transporter: nodemailer.Transporter | undefined;

async function initMailer () {
    const enabled: boolean = mailConfig.enabled;
    if (!enabled) return;

    if (process.env.NODE_ENV === 'production') {
        console.warn('Mailer in production mode. Emails will be sent to real recipients.');
    } else {
        console.info('Mailer in dev mode, email will be sent to', mailConfig.devMode.overrideTo);
    }

    transporter = nodemailer.createTransport(mailConfig.transporter);

    try {
        await transporter.verify();
        console.log('Mailer ready');
    } catch (err) {
        console.error('Mailer disabled due to error:\n', err);
        transporter = undefined;
    }
}

async function sendMail ({ to, subject, text, html }: Mail) {
    if (transporter === undefined) {
        console.warn('Mailer disabled, cannot send email: ', { to, subject })
        return;
    }

    if (process.env.NODE_ENV !== 'production') {
        console.log('Mailer in dev mode, email sent to ', mailConfig.devMode.overrideTo);
        subject = '[DEV] ' + subject + ' (original recipient: ' + to + ')';
        to = mailConfig.devMode.overrideTo;
    }

    const user: string = mailConfig.transporter.auth.user;

    const info = await transporter.sendMail({
        from: `"Car Share" <${user}>`, // sender address
        to, // list of receivers
        subject, // Subject line
        text, // plain text body
        html // html body
    });

    console.log('Message sent:', { to, subject }, { messageId: info.messageId });
}

export { initMailer, sendMail }
