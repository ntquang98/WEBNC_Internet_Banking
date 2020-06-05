module.exports = (user_name, otp, operation) => {
  return `
  <head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
  <style>
    .code {
      padding: 10px;
      background-color: "#f2f2f2";
      font-size: 30px;
    }
  </style>
</head>
<body>
  <div class="card">
      <h4>This is your S2Q Banking One Time Password</h4>
      <p>Dear, ${user_name},</p>
      <p>This is your verification code for ${operation}.</p>
      <p class="code"><strong>${otp}</strong></p>
      <p>This code will expire three minutes after this email was send.</p>
      <p><strong>Why you received this email</strong></p>
      <p>S2Q Bank requires verification whenever your bank account is doing importance operator such as:</p>
      <quote>transfer money, forgot password</quote>
      <p>If you did not make this request, It might be that someone have your account information. <a href="">Change your password to protected your account.</a></p>
      <p>Thank you!</p>
      <p>S2Q Banking Team</p>
  </div>
</body>`;
}