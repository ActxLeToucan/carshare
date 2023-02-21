import nodemailer from 'nodemailer';
import mailConfig from '../../mail.config.json';

let transporter: nodemailer.Transporter | undefined;

async function init () {
    const enabled: boolean = mailConfig.enabled;
    if (!enabled) return;

    console.warn('Mailer enabled');

    transporter = nodemailer.createTransport(mailConfig.transporter);

    try {
        await transporter.verify();
        console.log('Mailer ready');
    } catch (err) {
        console.error('Mailer disabled: ', err);
        transporter = undefined;
    }
}

async function send (to: string, subject: string, text: string, html: string) {
    if (transporter === undefined) {
        console.warn('Mailer disabled, cannot send email: ', { to, subject })
        return;
    }

    const user: string = mailConfig.transporter.auth.user;

    const info = await transporter.sendMail({
        from: `"Car Share" <${user}>`, // sender address
        to, // list of receivers
        subject, // Subject line
        text, // plain text body
        html // html body
    });

    console.log('Message sent: ', info.messageId);
}

export { init, send }
