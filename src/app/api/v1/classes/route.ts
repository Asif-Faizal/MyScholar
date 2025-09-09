import { NextRequest, NextResponse } from 'next/server'
import { ClassService } from '../services/ClassService'
import { schemas } from '../utils/validation'

const classService = new ClassService()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const result = await classService.getAllClasses(page, limit)

    return NextResponse.json({
      success: true,
      data: {
        classes: result.classes,
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
      error: error instanceof Error ? error.message : 'Failed to get classes'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request
    const { error } = schemas.createClass.validate(body)
    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Validation Error',
        message: error.details[0].message
      }, { status: 400 })
    }

    const result = await classService.createClass(body, 1) // Mock staff user ID

    return NextResponse.json({
      success: true,
      data: result
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create class'
    }, { status: 400 })
  }
}
