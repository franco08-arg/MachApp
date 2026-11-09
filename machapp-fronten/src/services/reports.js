const REPORTS_KEY = 'matchapp.reports'

export const REPORT_REASONS = ['Spam', 'Acoso', 'Perfil falso']

export const DEMO_REPORTS = [
  {
    id: 'demo-report-1',
    reportedUser: 'Valeria',
    reportedIdentifier: 'valeria',
    reason: 'Spam',
    reportedBy: 'demo@matchapp.pe',
    createdAt: '2026-11-02T18:30:00.000Z',
    status: 'pendiente',
  },
  {
    id: 'demo-report-2',
    reportedUser: 'Diego',
    reportedIdentifier: 'diego',
    reason: 'Acoso',
    reportedBy: 'demo@matchapp.pe',
    createdAt: '2026-11-05T21:10:00.000Z',
    status: 'pendiente',
  },
]

const readStoredReports = () => {
  try {
    const raw = window.localStorage.getItem(REPORTS_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const getReports = () => [...DEMO_REPORTS, ...readStoredReports()]

export const getReportedUsers = () => {
  const grouped = new Map()

  getReports().forEach((report) => {
    const key = String(
      report.reportedIdentifier ?? report.reportedUser ?? '',
    ).toLowerCase()

    const current = grouped.get(key) ?? {
      reportedUser: report.reportedUser,
      reportedIdentifier: report.reportedIdentifier,
      total: 0,
      reasons: [],
      lastReportAt: report.createdAt,
      status: report.status,
    }

    current.total += 1
    if (report.reason && !current.reasons.includes(report.reason)) {
      current.reasons.push(report.reason)
    }
    if (
      report.createdAt &&
      new Date(report.createdAt) > new Date(current.lastReportAt)
    ) {
      current.lastReportAt = report.createdAt
    }
    if (report.status === 'pendiente') {
      current.status = 'pendiente'
    }

    grouped.set(key, current)
  })

  return [...grouped.values()]
}

export const addReport = ({
  reportedUser,
  reportedIdentifier,
  reason,
  reportedBy,
}) => {
  if (!REPORT_REASONS.includes(reason)) {
    throw new Error('El motivo del reporte no es válido.')
  }

  const report = {
    id: `report-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    reportedUser: String(reportedUser ?? '').trim(),
    reportedIdentifier: String(reportedIdentifier ?? '').trim(),
    reason,
    reportedBy: String(reportedBy ?? '').trim(),
    createdAt: new Date().toISOString(),
    status: 'pendiente',
  }

  const stored = readStoredReports()
  window.localStorage.setItem(REPORTS_KEY, JSON.stringify([...stored, report]))

  return report
}
