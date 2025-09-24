import { NextResponse } from 'next/server'
import { UserService } from '../services/UserService'
import { schemas } from '../utils/validation'
import type { CreateUserRequest } from '../types'

const userService = new UserService()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const role = searchParams.get('role') as any

    const isRoleFilter = role && ['admin','staff','teacher','student'].includes(role)
    const result = isRoleFilter
      ? { users: await userService.getUsersByRole(role), total: 0 }
      : await userService.getAllUsers(page, limit)

    return NextResponse.json({
      success: true,
      data: {
        users: result.users.map(({ password_hash, ...user }) => user),
        pagination: isRoleFilter ? undefined : {
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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateUserRequest
    
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
