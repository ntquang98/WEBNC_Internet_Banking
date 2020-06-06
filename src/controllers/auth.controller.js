const authService = require('../services/auth.service');

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body.user_name, req.body.password);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
}

const refresh = async (req, res, next) => {
  try {
    let accessToken = req.headers['x-access-token'];
    let refreshToken = req.headers['x-refresh-token'];
    let result = await authService.refresh(accessToken, refreshToken);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
}

const forgotPasswordHandler = async (req, res, next) => {
  try {
    let { email } = req.body;
    let operation = "RESET PASSWORD";
    let mail_subject = "YOUR RESET PASSWORD OTP";
    await authService.sendOTP(email, operation, mail_subject);
    res.status(200).send({
      ok: true
    });
  } catch (error) {
    next(error);
  }
}

const resetPassword = async (req, res, next) => {
  try {
    let { email, OTP, password } = req.body;
    let result = await authService.resetPassword(email, OTP, password);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  refresh,
  forgotPasswordHandler,
  resetPassword,
}
