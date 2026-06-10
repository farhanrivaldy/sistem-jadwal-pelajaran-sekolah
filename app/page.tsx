'use client'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

type Schedule = {
  id: string
  class_code: string
  class_name: string
  subject_code: string
  teacher_nik: string
  teacher_name: string
  date: string
  jam_ke: number
  time_start: string
  time_end: string
}

type TeacherRecap = {
  teacher_nik: string
  teacher_name: string
  total_jp: number
  total_minutes: number
}

type StudentResponse = {
  class_code: string
  date: string
  total_jadwal: number
  schedules: Schedule[]
}

type TeacherResponse = {
  teacher_nik: string
  start_date: string
  end_date: string
  total_jp: number
  total_minutes: number
  schedules: Schedule[]
}

type ReportResponse = {
  start_date: string
  end_date: string
  total_teachers: number
  data: TeacherRecap[]
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ''
const apiKey = process.env.NEXT_PUBLIC_API_KEY || ''

const defaultSchedule = {
  class_code: 'XA01',
  class_name: 'X-A',
  subject_code: 'CHEM',
  teacher_nik: '20222029',
  teacher_name: 'Najdin Aqmarina, S.Pd.',
  date: '2025-02-10',
  jam_ke: '2',
  time_start: '08:40:00',
  time_end: '09:20:00',
}

function App() {
  const [scheduleForm, setScheduleForm] = useState(defaultSchedule)
  const [studentFilters, setStudentFilters] = useState({
    class_code: 'XA01',
    date: '2025-02-10',
  })
  const [teacherFilters, setTeacherFilters] = useState({
    teacher_nik: '20222029',
    start_date: '2025-02-10',
    end_date: '2025-02-14',
  })
  const [reportFilters, setReportFilters] = useState({
    start_date: '2025-02-01',
    end_date: '2025-02-28',
  })
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [studentData, setStudentData] = useState<StudentResponse | null>(null)
  const [teacherData, setTeacherData] = useState<TeacherResponse | null>(null)
  const [reportData, setReportData] = useState<ReportResponse | null>(null)
  const [status, setStatus] = useState('Siap terhubung ke backend.')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)

  useEffect(() => {
    void loadSchedules()
  }, [])

  async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const headers = new Headers(init?.headers)
    headers.set('x-api-key', apiKey)

    if (!(init?.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json')
    }

    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers,
    })

    if (!response.ok) {
      let message = `Request gagal dengan status ${response.status}`

      try {
        const result = (await response.json()) as { error?: string }
        if (result.error) {
          message = result.error
        }
      } catch {
        // Abaikan body non-JSON.
      }

      throw new Error(message)
    }

    return (await response.json()) as T
  }

  async function loadSchedules() {
    setLoading(true)
    setError('')

    try {
      const response = await apiFetch<{ data: Schedule[] }>('/api/schedules')
      setSchedules(response.data)
      setStatus(`Berhasil memuat ${response.data.length} jadwal.`)
    } catch (caughtError) {
      setError(getErrorMessage(caughtError))
      setStatus('Gagal memuat daftar jadwal.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateSchedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      await apiFetch<{ data: Schedule }>('/api/schedules', {
        method: 'POST',
        body: JSON.stringify({
          ...scheduleForm,
          jam_ke: Number(scheduleForm.jam_ke),
        }),
      })
      setStatus('Jadwal baru berhasil ditambahkan.')
      await loadSchedules()
    } catch (caughtError) {
      setError(getErrorMessage(caughtError))
      setStatus('Penambahan jadwal gagal.')
    } finally {
      setLoading(false)
    }
  }

  async function handleStudentSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams(studentFilters)
      const result = await apiFetch<StudentResponse>(`/api/schedules/student?${params}`)
      setStudentData(result)
      setStatus(`Jadwal siswa untuk kelas ${result.class_code} berhasil dimuat.`)
    } catch (caughtError) {
      setError(getErrorMessage(caughtError))
      setStatus('Pencarian jadwal siswa gagal.')
    } finally {
      setLoading(false)
    }
  }

  async function handleTeacherSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams(teacherFilters)
      const result = await apiFetch<TeacherResponse>(`/api/schedules/teacher?${params}`)
      setTeacherData(result)
      setStatus(`Rekap guru ${result.teacher_nik} berhasil dimuat.`)
    } catch (caughtError) {
      setError(getErrorMessage(caughtError))
      setStatus('Pencarian jadwal guru gagal.')
    } finally {
      setLoading(false)
    }
  }

  async function handleReportSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams(reportFilters)
      const result = await apiFetch<ReportResponse>(`/api/schedules/report/rekap-jp?${params}`)
      setReportData(result)
      setStatus(`Rekap yayasan untuk ${result.total_teachers} guru berhasil dimuat.`)
    } catch (caughtError) {
      setError(getErrorMessage(caughtError))
      setStatus('Rekap yayasan gagal dimuat.')
    } finally {
      setLoading(false)
    }
  }

  async function handleUploadExcel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!uploadFile) {
      setError('Pilih file Excel terlebih dahulu.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', uploadFile)

      const response = await fetch(`${apiBaseUrl}/api/schedules/upload`, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
        },
        body: formData,
      })

      if (!response.ok) {
        const result = (await response.json()) as { error?: string }
        throw new Error(result.error || 'Upload Excel gagal')
      }

      const result = (await response.json()) as { inserted_count: number }
      setStatus(`Upload berhasil. ${result.inserted_count} jadwal ditambahkan.`)
      setUploadFile(null)
      await loadSchedules()
    } catch (caughtError) {
      setError(getErrorMessage(caughtError))
      setStatus('Upload Excel gagal.')
    } finally {
      setLoading(false)
    }
  }

  async function handleExportExcel() {
    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams(reportFilters)
      const response = await fetch(`${apiBaseUrl}/api/schedules/export?${params}`, {
        headers: {
          'x-api-key': apiKey,
        },
      })

      if (!response.ok) {
        throw new Error('Export Excel gagal')
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = downloadUrl
      anchor.download = `rekap-jp-${reportFilters.start_date}-${reportFilters.end_date}.xlsx`
      anchor.click()
      window.URL.revokeObjectURL(downloadUrl)
      setStatus('File Excel rekap berhasil diunduh.')
    } catch (caughtError) {
      setError(getErrorMessage(caughtError))
      setStatus('Export Excel gagal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="eyebrow">Edulab Submission Companion</div>
        <h1>Dashboard Jadwal Sekolah untuk Siswa, Guru, dan Yayasan</h1>
        <p className="hero-copy">
          Frontend ini disiapkan untuk mendemokan endpoint yang diminta di soal:
          CRUD jadwal, upload Excel, export rekap JP, serta tampilan data per peran.
        </p>
      </section>

      <section className="status-strip">
        <div>
          <strong>Status:</strong> {status}
        </div>
        <div>
          <strong>Mode:</strong> {loading ? 'Memproses...' : 'Siap'}
        </div>
      </section>

      {error ? <div className="alert error">{error}</div> : null}

      <section className="dashboard-grid">
        <article className="card card-accent">
          <div className="card-header">
            <div>
              <p className="section-tag">Admin Sekolah</p>
              <h2>Tambah Jadwal Baru</h2>
            </div>
            <button type="button" className="ghost-button" onClick={() => void loadSchedules()}>
              Refresh daftar
            </button>
          </div>

          <form className="form-grid" onSubmit={handleCreateSchedule}>
            <label>
              Kode Kelas
              <input
                value={scheduleForm.class_code}
                onChange={(event) =>
                  setScheduleForm((current) => ({ ...current, class_code: event.target.value }))
                }
              />
            </label>
            <label>
              Nama Kelas
              <input
                value={scheduleForm.class_name}
                onChange={(event) =>
                  setScheduleForm((current) => ({ ...current, class_name: event.target.value }))
                }
              />
            </label>
            <label>
              Kode Mapel
              <input
                value={scheduleForm.subject_code}
                onChange={(event) =>
                  setScheduleForm((current) => ({ ...current, subject_code: event.target.value }))
                }
              />
            </label>
            <label>
              NIK Guru
              <input
                value={scheduleForm.teacher_nik}
                onChange={(event) =>
                  setScheduleForm((current) => ({ ...current, teacher_nik: event.target.value }))
                }
              />
            </label>
            <label className="span-2">
              Nama Guru
              <input
                value={scheduleForm.teacher_name}
                onChange={(event) =>
                  setScheduleForm((current) => ({ ...current, teacher_name: event.target.value }))
                }
              />
            </label>
            <label>
              Tanggal
              <input
                type="date"
                value={scheduleForm.date}
                onChange={(event) =>
                  setScheduleForm((current) => ({ ...current, date: event.target.value }))
                }
              />
            </label>
            <label>
              Jam Ke
              <input
                type="number"
                min="1"
                value={scheduleForm.jam_ke}
                onChange={(event) =>
                  setScheduleForm((current) => ({ ...current, jam_ke: event.target.value }))
                }
              />
            </label>
            <label>
              Mulai
              <input
                type="time"
                step="1"
                value={scheduleForm.time_start}
                onChange={(event) =>
                  setScheduleForm((current) => ({ ...current, time_start: event.target.value }))
                }
              />
            </label>
            <label>
              Selesai
              <input
                type="time"
                step="1"
                value={scheduleForm.time_end}
                onChange={(event) =>
                  setScheduleForm((current) => ({ ...current, time_end: event.target.value }))
                }
              />
            </label>
            <div className="span-2 form-actions">
              <button type="submit" className="primary-button" disabled={loading}>
                Simpan jadwal
              </button>
            </div>
          </form>
        </article>

        <article className="card">
          <p className="section-tag">Import / Export</p>
          <h2>Upload dan Export Excel</h2>
          <form className="stack-form" onSubmit={handleUploadExcel}>
            <label>
              Upload file `.xlsx`
              <input
                type="file"
                accept=".xlsx"
                onChange={(event) => setUploadFile(event.target.files?.[0] || null)}
              />
            </label>
            <button type="submit" className="primary-button" disabled={loading}>
              Upload jadwal
            </button>
          </form>

          <div className="divider" />

          <form className="form-grid compact-form" onSubmit={handleReportSearch}>
            <label>
              Start Date
              <input
                type="date"
                value={reportFilters.start_date}
                onChange={(event) =>
                  setReportFilters((current) => ({ ...current, start_date: event.target.value }))
                }
              />
            </label>
            <label>
              End Date
              <input
                type="date"
                value={reportFilters.end_date}
                onChange={(event) =>
                  setReportFilters((current) => ({ ...current, end_date: event.target.value }))
                }
              />
            </label>
            <div className="span-2 split-actions">
              <button type="submit" className="secondary-button" disabled={loading}>
                Ambil rekap
              </button>
              <button type="button" className="ghost-button" onClick={handleExportExcel}>
                Export Excel
              </button>
            </div>
          </form>
        </article>

        <article className="card">
          <p className="section-tag">Frontend Siswa</p>
          <h2>Jadwal Harian Kelas</h2>
          <form className="form-grid compact-form" onSubmit={handleStudentSearch}>
            <label>
              Kode Kelas
              <input
                value={studentFilters.class_code}
                onChange={(event) =>
                  setStudentFilters((current) => ({ ...current, class_code: event.target.value }))
                }
              />
            </label>
            <label>
              Tanggal
              <input
                type="date"
                value={studentFilters.date}
                onChange={(event) =>
                  setStudentFilters((current) => ({ ...current, date: event.target.value }))
                }
              />
            </label>
            <div className="span-2 form-actions">
              <button type="submit" className="secondary-button" disabled={loading}>
                Cari jadwal siswa
              </button>
            </div>
          </form>
          {studentData ? (
            <div className="result-block">
              <div className="result-summary">
                <strong>{studentData.class_code}</strong>
                <span>{studentData.date}</span>
                <span>{studentData.total_jadwal} jadwal</span>
              </div>
              <ScheduleTable schedules={studentData.schedules} />
            </div>
          ) : null}
        </article>

        <article className="card">
          <p className="section-tag">Frontend Guru</p>
          <h2>Rekap Mengajar per Pengajar</h2>
          <form className="form-grid compact-form" onSubmit={handleTeacherSearch}>
            <label className="span-2">
              NIK Guru
              <input
                value={teacherFilters.teacher_nik}
                onChange={(event) =>
                  setTeacherFilters((current) => ({
                    ...current,
                    teacher_nik: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              Start Date
              <input
                type="date"
                value={teacherFilters.start_date}
                onChange={(event) =>
                  setTeacherFilters((current) => ({
                    ...current,
                    start_date: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              End Date
              <input
                type="date"
                value={teacherFilters.end_date}
                onChange={(event) =>
                  setTeacherFilters((current) => ({ ...current, end_date: event.target.value }))
                }
              />
            </label>
            <div className="span-2 form-actions">
              <button type="submit" className="secondary-button" disabled={loading}>
                Cari rekap guru
              </button>
            </div>
          </form>
          {teacherData ? (
            <div className="result-block">
              <div className="metric-row">
                <div className="metric-card">
                  <span>Total JP</span>
                  <strong>{teacherData.total_jp}</strong>
                </div>
                <div className="metric-card">
                  <span>Total Menit</span>
                  <strong>{teacherData.total_minutes}</strong>
                </div>
              </div>
              <ScheduleTable schedules={teacherData.schedules} />
            </div>
          ) : null}
        </article>
      </section>

      <section className="card full-width-card">
        <div className="card-header">
          <div>
            <p className="section-tag">Semua Data</p>
            <h2>Daftar Jadwal Tersimpan</h2>
          </div>
          <span className="chip">{schedules.length} records</span>
        </div>
        <ScheduleTable schedules={schedules} />
      </section>

      <section className="card full-width-card">
        <div className="card-header">
          <div>
            <p className="section-tag">Frontend Yayasan</p>
            <h2>Rekap Jam Pelajaran Semua Guru</h2>
          </div>
          {reportData ? <span className="chip">{reportData.total_teachers} guru</span> : null}
        </div>
        {reportData ? <TeacherRecapTable items={reportData.data} /> : <p>Belum ada data rekap.</p>}
      </section>
    </main>
  )
}

function ScheduleTable({ schedules }: { schedules: Schedule[] }) {
  if (!schedules.length) {
    return <p className="empty-state">Belum ada data jadwal untuk ditampilkan.</p>
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Kelas</th>
            <th>Mapel</th>
            <th>Guru</th>
            <th>Tanggal</th>
            <th>JP</th>
            <th>Waktu</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((schedule) => (
            <tr key={schedule.id}>
              <td>
                <strong>{schedule.class_code}</strong>
                <span>{schedule.class_name}</span>
              </td>
              <td>{schedule.subject_code}</td>
              <td>
                <strong>{schedule.teacher_name}</strong>
                <span>{schedule.teacher_nik}</span>
              </td>
              <td>{schedule.date}</td>
              <td>{schedule.jam_ke}</td>
              <td>
                {schedule.time_start} - {schedule.time_end}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TeacherRecapTable({ items }: { items: TeacherRecap[] }) {
  if (!items.length) {
    return <p className="empty-state">Belum ada rekap guru pada rentang tanggal tersebut.</p>
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>NIK Guru</th>
            <th>Nama Guru</th>
            <th>Total JP</th>
            <th>Total Menit</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.teacher_nik}>
              <td>{item.teacher_nik}</td>
              <td>{item.teacher_name}</td>
              <td>{item.total_jp}</td>
              <td>{item.total_minutes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Terjadi kesalahan yang tidak diketahui.'
}

export default App
