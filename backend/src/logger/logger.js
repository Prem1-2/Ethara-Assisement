import winston from "winston";
const { combine, timestamp, printf, colorize, align } = winston.format;

const logLevels = {
	fatal: 0,
	error: 1,
	warn: 2,
	info: 3,
	debug: 4,
	trace: 5,
};

const logger = winston.createLogger({
	levels: logLevels,
	level: process.env.LOG_LEVEL || "info",
	format: combine(
		colorize({ all: true }),
		timestamp({
			format: "YYYY-MM-DD hh:mm:ss.SSS A",
		}),
		align(),
		printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`),
	),
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({
			filename: "combined.log",
		}),
		new winston.transports.File({
			filename: "app-error.log",
			level: "error",
		}),
	],
});

export default logger;
