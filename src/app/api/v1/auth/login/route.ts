import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '../../services/UserService'
import { AuthUtils } from '../../utils/auth'
import { schemas } from '../../utils/validation'

const userService = new UserService()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request
    const { error } = schemas.login.validate(body)
    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Validation Error',
        message: error.details[0].message
      }, { status: 400 })
    }

    // Call the user service directly
    const result = await userService.login(body)

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Login failed'
    }, { status: 401 })
  }
}
