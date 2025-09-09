import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '../services/UserService'
import { schemas } from '../utils/validation'

const userService = new UserService()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const result = await userService.getAllUsers(page, limit)

    return NextResponse.json({
      success: true,
      data: {
        users: result.users.map(({ password_hash, ...user }) => user),
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        }
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get users'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request
    const { error } = schemas.createUser.validate(body)
    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Validation Error',
        message: error.details[0].message
      }, { status: 400 })
    }

    const result = await userService.createUser(body, 1) // Mock admin user ID

    return NextResponse.json({
      success: true,
      data: {
        user_id: result.user_id,
        role: result.role,
        alias: result.alias,
        email: result.email,
        created_at: result.created_at
      }
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create user'
    }, { status: 400 })
  }
}
