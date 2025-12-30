import { z } from 'zod'

// Password: min 8, at least 1 uppercase, 1 lowercase, 1 number and 1 special char
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email là bắt buộc')
      .email('Email không hợp lệ')
      .refine((val) => val.toLowerCase().endsWith('@gmail.com'), {
        message: 'Chỉ chấp nhận địa chỉ email Gmail (@gmail.com)',
      }),

    full_name: z.string().min(1, 'Họ và tên là bắt buộc'),

    password: z
      .string()
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .regex(passwordRegex, 'Mật khẩu phải gồm chữ hoa, chữ thường, số và ký tự đặc biệt'),

    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })


export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email là bắt buộc')
    .email('Email không hợp lệ')
    .refine((val) => val.toLowerCase().endsWith('@gmail.com'), {
      message: 'Chỉ chấp nhận địa chỉ email Gmail (@gmail.com)',
    }),
  password: z
    .string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(
      passwordRegex,
      'Mật khẩu phải gồm chữ hoa, chữ thường, số và ký tự đặc biệt'
    ),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>

