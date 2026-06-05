import { createElement } from "react";
import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import UsersModel from "../models/users.model.js";
import VerificationEmail from "../templates/verifyEmail.jsx";
import PasswordReset from "../templates/passwordreset.jsx";

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: process.env.SMTP_PORT,
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
});

const ALLOWED_EMAIL_TYPES = new Set(["VERIFY", "RESET"]);

export const sendEmail = async ({ email, emailType, userId, username }) => {
	if (!ALLOWED_EMAIL_TYPES.has(emailType)) {
		throw new Error("Invalid emailType provided");
	}
	const safeUsername = String(username).replace(/[^a-zA-Z0-9_ -]/g, "");
	try {
		const rawToken = crypto.randomBytes(32).toString("hex");

		const token = jwt.sign({ userId }, process.env.TOKEN_SECRET, {
			expiresIn: "1h",
		}); // jwt for reset password

		let actionUrl;
		if (emailType === "VERIFY") {
			actionUrl = `${process.env.DOMAIN_URL}/verifyemail?token=${rawToken}`;
			await UsersModel.findByIdAndUpdate(userId, {
				verifytoken: rawToken,
				verifytokenexpiry: Date.now() + 5 * 60 * 1000, // 5 minutes instead of 10
			});
		} else {
			await UsersModel.findByIdAndUpdate(userId, {
				forgotpasswordtoken: token,
				forgotpasswordtokenexpiry: Date.now() + 5 * 60 * 1000,
			});
			actionUrl = `${process.env.DOMAIN_URL}/auth/reset-password?token=${token}`;
		}

		let htmlContent;
		if (emailType === "VERIFY") {
			htmlContent = await render(
				createElement(VerificationEmail, {
					username: safeUsername,
					verificationUrl: actionUrl,
				}),
			);
		} else {
			htmlContent = await render(
				createElement(PasswordReset, {
					username: safeUsername,
					resetUrl: actionUrl,
				}),
			);
		}

		const mailoptions = {
			from: process.env.SENDER_EMAIL,
			to: email,
			subject: emailType === "VERIFY" ? "verify email" : "Reset your password",
			html: htmlContent,
		};
		const mailresponse = await transporter.sendMail(mailoptions);
		return mailresponse;
	} catch (error) {
		console.log(error.message);
		throw new Error(error.message);
	}
};
