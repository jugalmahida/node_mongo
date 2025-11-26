import { customAlphabet } from "nanoid";
import validator from "validator";
import ShortUrl from "../models/url.model.js";

const RAW_CODE_LENGTH = Number(process.env.SHORT_CODE_LENGTH || 8);
const RAW_TTL_DAYS = Number(process.env.SHORT_URL_TTL_DAYS || 30);

const CODE_LENGTH =
  Number.isFinite(RAW_CODE_LENGTH) && RAW_CODE_LENGTH >= 5
    ? RAW_CODE_LENGTH
    : 8;
const DEFAULT_TTL_DAYS =
  Number.isFinite(RAW_TTL_DAYS) && RAW_TTL_DAYS >= 0 ? RAW_TTL_DAYS : 30;

const generateCode = customAlphabet(
  "23456789abcdefghkmnpqrstuvwxyz",
  CODE_LENGTH
);

const buildBaseUrl = (req) => {
  const configured =
    process.env.SHORT_BASE_URL &&
    process.env.SHORT_BASE_URL.trim().replace(/\/$/, "");
  if (configured) {
    return configured;
  }
  const forwardedProtocol = req.get("x-forwarded-proto");
  const forwardedHost = req.get("x-forwarded-host");
  const protocol =
    process.env.SHORT_BASE_PROTOCOL ||
    forwardedProtocol ||
    req.protocol ||
    "http";
  const host = forwardedHost || req.get("host");
  return `${protocol}://${host}`;
};

const normalizeAlias = (value) =>
  value ? value.trim().toLowerCase().replace(/\s+/g, "") : "";

const isAliasValid = (alias) => /^[a-z0-9_-]+$/.test(alias);

const resolveExpiryDate = (expiresAt) => {
  if (!expiresAt && DEFAULT_TTL_DAYS <= 0) {
    return null;
  }
  if (expiresAt) {
    const parsed = new Date(expiresAt);
    if (Number.isNaN(parsed.getTime())) {
      return { error: "expiresAt must be a valid date string" };
    }
    if (parsed <= new Date()) {
      return { error: "expiresAt must be in the future" };
    }
    return { value: parsed };
  }
  const ttlMs = DEFAULT_TTL_DAYS * 24 * 60 * 60 * 1000;
  return { value: new Date(Date.now() + ttlMs) };
};

export const createShortUrl = async (req, res, next) => {
  try {
    const { destinationUrl, alias, expiresAt } = req.body;

    if (
      !destinationUrl ||
      !validator.isURL(destinationUrl, { require_protocol: true })
    ) {
      return res.status(400).json({
        success: false,
        message: "destinationUrl must be a valid absolute URL.",
      });
    }

    let shortCode = normalizeAlias(alias);
    if (shortCode && !isAliasValid(shortCode)) {
      return res.status(400).json({
        success: false,
        message: "alias may only contain a-z, 0-9, '-' or '_'.",
      });
    }

    if (shortCode) {
      const aliasExists = await ShortUrl.exists({ shortCode });
      if (aliasExists) {
        return res
          .status(409)
          .json({ success: false, message: "alias already in use." });
      }
    } else {
      do {
        shortCode = generateCode();
      } while (await ShortUrl.exists({ shortCode }));
    }

    const expiryResult = resolveExpiryDate(expiresAt);
    if (expiryResult?.error) {
      return res
        .status(400)
        .json({ success: false, message: expiryResult.error });
    }

    const shortUrl = await ShortUrl.create({
      destinationUrl: destinationUrl.trim(),
      shortCode,
      expiresAt: expiryResult?.value || null,
    });

    return res.status(201).json({
      success: true,
      data: {
        id: shortUrl.id,
        destinationUrl: shortUrl.destinationUrl,
        shortCode: shortUrl.shortCode,
        shortUrl: `${buildBaseUrl(req)}/r/${shortUrl.shortCode}`,
        expiresAt: shortUrl.expiresAt,
        createdAt: shortUrl.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getShortUrlDetails = async (req, res, next) => {
  try {
    const shortCode = normalizeAlias(req.params.code);
    const shortUrl = await ShortUrl.findOne({ shortCode }).lean();

    if (!shortUrl) {
      return res
        .status(404)
        .json({ success: false, message: "Short URL not found." });
    }

    const now = new Date();
    const isExpired = Boolean(shortUrl.expiresAt && shortUrl.expiresAt < now);

    return res.json({
      success: true,
      data: {
        id: shortUrl._id,
        destinationUrl: shortUrl.destinationUrl,
        shortCode: shortUrl.shortCode,
        shortUrl: `${buildBaseUrl(req)}/r/${shortUrl.shortCode}`,
        expiresAt: shortUrl.expiresAt,
        createdAt: shortUrl.createdAt,
        updatedAt: shortUrl.updatedAt,
        visitCount: shortUrl.visitCount,
        lastVisitedAt: shortUrl.lastVisitedAt,
        isExpired,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const redirectShortUrl = async (req, res, next) => {
  try {
    const shortCode = normalizeAlias(req.params.code);
    const shortUrl = await ShortUrl.findOne({ shortCode });

    if (!shortUrl) {
      return res.status(404).json({
        success: false,
        message: "Short URL not found.",
      });
    }

    if (shortUrl.expiresAt && shortUrl.expiresAt < new Date()) {
      return res.status(410).json({
        success: false,
        message: "This short URL has expired.",
      });
    }

    shortUrl.visitCount += 1;
    shortUrl.lastVisitedAt = new Date();
    await shortUrl.save();

    return res.redirect(shortUrl.destinationUrl);
  } catch (error) {
    next(error);
  }
};
