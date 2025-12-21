import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Extract and validate payload
    const { email, username, password } = body

    // Basic validation
    if (!email || !username || !password) {
      return NextResponse.json(
        { message: 'Email, username, and password are required' },
        { status: 400 }
      )
    }

    // Validate email is Gmail (as per our validator)
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return NextResponse.json(
        { message: 'Chỉ chấp nhận địa chỉ email Gmail (@gmail.com)' },
        { status: 400 }
      )
    }

    // TODO: Here you would typically:
    // 1. Hash the password
    // 2. Save user to database
    // 3. Send verification email
    // 4. Return success response

    // For now, simulate successful registration
    console.log('Registration request received:', { email, username })

    return NextResponse.json(
      {
        success: true,
        message: 'Đăng ký thành công',
        user: {
          email,
          username,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Register API error:', error)
    return NextResponse.json(
      { message: 'Lỗi server nội bộ' },
      { status: 500 }
    )
  }
}
