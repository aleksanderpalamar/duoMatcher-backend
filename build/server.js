"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const cors_1 = __importDefault(require("cors"));
const convert_hour_string_to_minutes_1 = require("./utils/convert-hour-string-to-minutes");
const convert_minutes_to_hour_string_1 = require("./utils/convert-minutes-to-hour-string");
const allowedOrigins = [
    "http://localhost:3000",
    "https://duo-matcher-frontend-lpkv.vercel.app/"
];
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: 'https://duo-matcher-frontend-lpkv.vercel.app/'
}));
const prisma = new client_1.PrismaClient();
app.get("/games", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const games = yield prisma.game.findMany({
        include: {
            _count: {
                select: {
                    ads: true,
                },
            },
        },
    });
    return res.json(games);
}));
app.post("/games/:id/ads", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const gameId = request.params.id;
    const body = request.body;
    const ad = yield prisma.ad.create({
        data: {
            gameId,
            name: body.name,
            yearsPlaying: body.yearsPlaying,
            discord: body.discord,
            weekDays: body.weekDays.join(","),
            hoursStart: (0, convert_hour_string_to_minutes_1.convertHourStringToMinutes)(body.hourStart),
            hoursEnd: (0, convert_hour_string_to_minutes_1.convertHourStringToMinutes)(body.hourEnd),
            useVoiceChannel: body.useVoiceChannel,
        },
    });
    return response.status(201).json(ad);
}));
app.get("/games/:id/ads", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const gameId = req.params.id;
    const ads = yield prisma.ad.findMany({
        select: {
            id: true,
            name: true,
            weekDays: true,
            useVoiceChannel: true,
            yearsPlaying: true,
            hoursStart: true,
            hoursEnd: true,
        },
        where: {
            gameId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    return res.json(ads.map((ad) => {
        return Object.assign(Object.assign({}, ad), { weekDays: ad.weekDays.split(","), hoursStart: (0, convert_minutes_to_hour_string_1.convertMinutesToHourString)(ad.hoursStart), hoursEnd: (0, convert_minutes_to_hour_string_1.convertMinutesToHourString)(ad.hoursEnd) });
    }));
}));
app.get("/ads/:id/discord", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const adId = req.params.id;
    const ad = yield prisma.ad.findUniqueOrThrow({
        select: {
            discord: true,
        },
        where: {
            id: adId,
        },
    });
    return res.json({
        discord: ad.discord,
    });
}));
app.listen(3000, () => {
    console.log("Server started on port 3000");
});
