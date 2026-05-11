export const otpTemplate = (otp) => `
  <div style="font-family:Arial;padding:20px">
    <h2>PetVeda Verification OTP</h2>
    <p>Your OTP is:</p>
    <h1 style="color:#4f46e5">${otp}</h1>
    <p>Valid for 10 minutes only.</p>
  </div>
`;