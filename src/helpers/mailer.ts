// domain.com/verifytoken/klfjsdkjfiosdjfk -> this approach is better if we doing everything from server component
// domanin.com/verifyToken?token=klfjsdkjfiosdjfk -> this approach is better if i am using client component

import nodemailer from 'nodemailer';
import User from '@/models/userModel'
import bcryptjs from 'bcryptjs'


export const sendEmail = async ({ email, emailType, userId }: any) => {
    try {
        // create a hashed token
        const hashedToken = await bcryptjs.hash(userId.toString(), 10)

        if (emailType === 'VERIFY') {
            await User.findByIdAndUpdate(userId,
                {
                    verifyToken: hashedToken,
                    verifyTokenExpiry: Date.now() + 3600000
                }

            )
        } else if (emailType === 'RESET') {
            await User.findByIdAndUpdate(userId,
                {
                    forgotPasswordToken: hashedToken,
                    forgotPasswordTokenExpiry: Date.now() + 3600000
                }
            )
        }

        var transport = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: "192af519062963",
                pass: "9c81a8943da953"

            }
        });

        const mailOptions = {
            from: 'kartikmakhloga20@gmail.com',
            to: email,
            subject: emailType == "VERIFY" ? "Verify your email" : "Reset your password",
            html: `<p>Click <a href="${process.env.DOMAIN}/verifyemail?token=${hashedToken}">here</a> to ${emailType === "VERIFY" ? "verify your email" : "reset your password"}
            or copy and paste the link below in your browser. <br>${process.env.DOMAIN}/verifyemail?token=${hashedToken}</p>`
        }

        const mailResonse = await transport.sendMail(mailOptions);

        return mailResonse;

    } catch (error: any) {
        throw new Error(error.message);
    }
}