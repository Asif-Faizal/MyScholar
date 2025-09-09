import { NextRequest, NextResponse } from 'next/server'
import { AuthController } from '../../controllers/AuthController'
import { authenticateToken } from '../../middleware/auth'

const authController = new AuthController()

export async function GET(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({
        success: false,
        error: 'Authorization header is required'
      }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Invalid authorization header format'
      }, { status: 401 })
    }

    // Create a mock request object with user info
    const mockReq = {
      user: { user_id: 1, role: 'admin', email: 'admin@myscholar.com' } // This should be extracted from token
    } as any

    const result = await authController.getProfile(mockReq, {
      json: (data: any) => data,
      status: (code: number) => ({ json: (data: any) => ({ ...data, status: code }) })
    } as any)

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get profile'
    }, { status: 500 })
  }
}
