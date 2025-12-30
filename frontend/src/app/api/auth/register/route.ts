import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Extract and validate payload
    const { email, full_name, password } = body

    // Basic validation
    if (!email || !full_name || !password) {
      return NextResponse.json(
        { message: 'Email, full_name, and password are required' },
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

    console.log('Registration request received:', { email, full_name })

    return NextResponse.json(
      {
        success: true,
        message: 'Đăng ký thành công',
        user: {
          email,
          full_name,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Register API error:', error)
    return NextResponse.json({ message: 'Lỗi server nội bộ' }, { status: 500 })
  }
}
