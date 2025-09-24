import { NextResponse } from 'next/server'
import { AttendanceService } from '../services/AttendanceService'

const attendanceService = new AttendanceService()

// GET /api/v1/attendance?user_id=123&start=2025-01-01&end=2025-12-31
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userIdParam = searchParams.get('user_id')
    const start = searchParams.get('start') || undefined
    const end = searchParams.get('end') || undefined

    if (!userIdParam) {
      return NextResponse.json({ success: false, error: 'user_id is required' }, { status: 400 })
    }

    const userId = parseInt(userIdParam)
    if (Number.isNaN(userId) || userId <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid user_id' }, { status: 400 })
    }

    const [reports, stats] = await Promise.all([
      attendanceService.getAttendanceByUser(userId, start, end),
      attendanceService.getAttendanceStats(userId, start, end)
    ])

    return NextResponse.json({ success: true, data: { reports, stats } })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get attendance'
    }, { status: 500 })
  }
}


