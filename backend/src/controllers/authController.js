const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { generarAccessToken, generarRefreshToken } = require('../utils/generateToken');

const esProduccion = process.env.NODE_ENV === 'production';
const cookieOptions = {
  httpOnly: true,
  secure: esProduccion, // SameSite=None exige secure:true (solo funciona sobre https)
  sameSite: esProduccion ? 'none' : 'lax', // 'none' porque el front y el back viven en dominios distintos
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const register = asyncHandler(async (req, res) => {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
  }

  const existente = await User.findOne({ email: email.toLowerCase() });
  if (existente) {
    return res.status(409).json({ error: 'Ya existe una cuenta con ese email.' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ nombre, email, passwordHash });

  const accessToken = generarAccessToken(user._id);
  const refreshToken = generarRefreshToken(user._id);
  res.cookie('refreshToken', refreshToken, cookieOptions);

  res.status(201).json({ data: { user, accessToken } });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios.' });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user || !(await user.compararPassword(password))) {
    return res.status(401).json({ error: 'Email o contraseña incorrectos.' });
  }

  const accessToken = generarAccessToken(user._id);
  const refreshToken = generarRefreshToken(user._id);
  res.cookie('refreshToken', refreshToken, cookieOptions);

  res.json({ data: { user, accessToken } });
});

const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res.status(401).json({ error: 'No hay sesión activa.' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const accessToken = generarAccessToken(payload.id);
    res.json({ data: { accessToken } });
  } catch (err) {
    return res.status(401).json({ error: 'La sesión venció. Iniciá sesión de nuevo.' });
  }
});

const me = asyncHandler(async (req, res) => {
  res.json({ data: { user: req.user } });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie('refreshToken', cookieOptions);
  res.json({ data: { ok: true } });
});

module.exports = { register, login, refresh, me, logout };
