"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Heart, Sparkles, Coffee, TrendingUp, Lock, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { verifyLogin } from "@/lib/auth"

interface PeriodData {
  [year: string]: {
    [month: string]: number[]
  }
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const YEARS = [2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030]

const FUNNY_MESSAGES = [
  "Aunt Flo is visiting! 🩸",
  "Red tide alert! 🌊",
  "Crimson wave incoming! 🌊",
  "Monthly subscription activated! 📅",
  "Nature's reminder that you're not pregnant! 🎉",
  "Time for chocolate therapy! 🍫",
  "Uterus is spring cleaning! 🧹",
]

const MOTIVATIONAL_QUOTES = [
  "You're stronger than your cramps! 💪",
  "Period power activated! ⚡",
  "Bleeding but still leading! 👑",
  "Hormones can't dim your shine! ✨",
  "Monthly warrior mode: ON! ⚔️",
]

export default function ShravyaPeriodTracker() {
  const [currentYear, setCurrentYear] = useState(2025)
  const [periodData, setPeriodData] = useState<PeriodData>({})
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentMessage, setCurrentMessage] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Load user data on component mount
  useEffect(() => {
    const savedLogin = localStorage.getItem("shravyaPeriodTrackerAuth")
    if (savedLogin === "authenticated") {
      setIsLoggedIn(true)
      loadUserData()
    }

    // Set random motivational message
    const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]
    setCurrentMessage(randomQuote)
  }, [])

  const loadUserData = () => {
    const savedData = localStorage.getItem("shravyaPeriodData")
    if (savedData) {
      setPeriodData(JSON.parse(savedData))
    }
  }

  const saveUserData = (data: PeriodData) => {
    localStorage.setItem("shravyaPeriodData", JSON.stringify(data))
  }

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setLoginError("Please enter both username and password! 🔐")
      return
    }

    setIsLoading(true)
    setLoginError("")

    try {
      const result = await verifyLogin(username, password)

      if (result.success) {
        localStorage.setItem("shravyaPeriodTrackerAuth", "authenticated")
        setIsLoggedIn(true)
        loadUserData()
        setCurrentMessage(result.message)
      } else {
        setLoginError(result.message)
      }
    } catch (error) {
      setLoginError("Something went wrong. Try again! 😅")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("shravyaPeriodTrackerAuth")
    setIsLoggedIn(false)
    setUsername("")
    setPassword("")
    setPeriodData({})
  }

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const togglePeriodDate = (year: number, month: number, day: number) => {
    setPeriodData((prev) => {
      const yearKey = year.toString()
      const monthKey = month.toString()

      const newData = { ...prev }

      if (!newData[yearKey]) {
        newData[yearKey] = {}
      }

      if (!newData[yearKey][monthKey]) {
        newData[yearKey][monthKey] = []
      }

      const dayIndex = newData[yearKey][monthKey].indexOf(day)
      if (dayIndex > -1) {
        newData[yearKey][monthKey] = newData[yearKey][monthKey].filter((d) => d !== day)
      } else {
        newData[yearKey][monthKey] = [...newData[yearKey][monthKey], day].sort((a, b) => a - b)
        // Show funny message when adding a period date
        const funnyMsg = FUNNY_MESSAGES[Math.floor(Math.random() * FUNNY_MESSAGES.length)]
        setCurrentMessage(funnyMsg)
      }

      saveUserData(newData)
      return newData
    })
  }

  const isPeriodDate = (year: number, month: number, day: number) => {
    const yearKey = year.toString()
    const monthKey = month.toString()
    return periodData[yearKey]?.[monthKey]?.includes(day) || false
  }

  const getPeriodDatesForMonth = (year: number, month: number) => {
    const yearKey = year.toString()
    const monthKey = month.toString()
    return periodData[yearKey]?.[monthKey] || []
  }

  const getTotalPeriodDays = (year: number) => {
    const yearKey = year.toString()
    if (!periodData[yearKey]) return 0

    return Object.values(periodData[yearKey]).reduce((total, monthDays) => {
      return total + monthDays.length
    }, 0)
  }

  // Calculate period cycles for a month (consecutive days grouped as one cycle)
  const getPeriodCyclesForMonth = (year: number, month: number) => {
    const dates = getPeriodDatesForMonth(year, month)
    if (dates.length === 0) return 0

    let cycles = 1
    const sortedDates = [...dates].sort((a, b) => a - b)

    for (let i = 1; i < sortedDates.length; i++) {
      // If gap is more than 2 days, consider it a new cycle
      if (sortedDates[i] - sortedDates[i - 1] > 2) {
        cycles++
      }
    }

    return cycles
  }

  const renderCalendar = (year: number, monthIndex: number) => {
    const daysInMonth = getDaysInMonth(year, monthIndex)
    const firstDay = getFirstDayOfMonth(year, monthIndex)
    const periodDates = getPeriodDatesForMonth(year, monthIndex)

    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isPeriod = isPeriodDate(year, monthIndex, day)
      days.push(
        <button
          key={day}
          onClick={() => togglePeriodDate(year, monthIndex, day)}
          className={`h-10 w-10 rounded-full text-sm font-medium transition-all duration-200 hover:scale-110 ${
            isPeriod
              ? "bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg hover:from-pink-600 hover:to-red-600 animate-pulse"
              : "hover:bg-pink-100 hover:text-pink-600 border-2 border-transparent hover:border-pink-300"
          }`}
        >
          {isPeriod ? "🩸" : day}
        </button>,
      )
    }

    return (
      <Card className="w-full hover:shadow-lg transition-shadow duration-300 border-pink-200">
        <CardHeader className="pb-3 bg-gradient-to-r from-pink-50 to-purple-50">
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              {MONTHS[monthIndex]}
              <Sparkles className="h-4 w-4 text-pink-500" />
            </span>
            {periodDates.length > 0 && (
              <div className="flex gap-1">
                <Badge variant="secondary" className="bg-pink-100 text-pink-800 text-xs">
                  {getPeriodCyclesForMonth(year, monthIndex)} cycles
                </Badge>
                <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
                  {periodDates.length} days
                </Badge>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">{days}</div>
          {periodDates.length > 0 && (
            <div className="mt-3 pt-3 border-t border-pink-200">
              <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                <Heart className="h-3 w-3 text-pink-500" />
                Period dates:
              </p>
              <div className="flex flex-wrap gap-1">
                {periodDates.map((date) => (
                  <span key={date} className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded-full">
                    {date}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 text-6xl animate-bounce">🌸</div>
          <div className="absolute top-20 right-20 text-4xl animate-pulse">💕</div>
          <div className="absolute bottom-20 left-20 text-5xl animate-bounce delay-300">🌺</div>
          <div className="absolute bottom-10 right-10 text-3xl animate-pulse delay-500">✨</div>
        </div>

        <Card className="w-full max-w-md shadow-2xl border-pink-200 relative z-10">
          <CardHeader className="text-center bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-t-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Lock className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Shravya's Period Tracker</h1>
              <Lock className="h-8 w-8" />
            </div>
            <p className="text-pink-100">Your personal period sanctuary! 🌸</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="text-center">
                <Coffee className="h-12 w-12 text-pink-500 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">
                  Welcome back, Shravya! ✨<br />
                  Please login to access your period data.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1 border-pink-300 focus:border-pink-500"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-pink-300 focus:border-pink-500 pr-10"
                      onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600 text-sm text-center">{loginError}</p>
                  </div>
                )}

                <Button
                  onClick={handleLogin}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                  disabled={isLoading || !username.trim() || !password.trim()}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Logging in...
                    </>
                  ) : (
                    <>
                      <Heart className="h-4 w-4 mr-2" />
                      Enter My Period Palace 👑
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center">Your data is secure and private! 🔒</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-pink-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="h-10 w-10 text-pink-600 animate-bounce" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Shravya's Period Tracker
            </h1>
            <Sparkles className="h-10 w-10 text-purple-600 animate-pulse" />
          </div>
          <p className="text-gray-600 mb-2">Hey Shravya! Track your monthly adventures 🎢</p>
          <div className="bg-white rounded-full px-4 py-2 inline-block shadow-md border-2 border-pink-200">
            <p className="text-sm text-pink-600 font-medium">{currentMessage}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="ml-4 border-pink-300 text-pink-600 hover:bg-pink-50"
          >
            Logout
          </Button>
        </div>

        {/* Year Navigation */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentYear((prev) => Math.max(2023, prev - 1))}
            disabled={currentYear <= 2023}
            className="border-pink-300 hover:bg-pink-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex gap-2 flex-wrap justify-center">
            {YEARS.map((year) => (
              <Button
                key={year}
                variant={currentYear === year ? "default" : "outline"}
                onClick={() => setCurrentYear(year)}
                className={`min-w-[80px] ${
                  currentYear === year
                    ? "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                    : "border-pink-300 hover:bg-pink-50"
                }`}
              >
                {year}
                {getTotalPeriodDays(year) > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs bg-pink-100 text-pink-800">
                    {getTotalPeriodDays(year)}
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentYear((prev) => Math.min(2030, prev + 1))}
            disabled={currentYear >= 2030}
            className="border-pink-300 hover:bg-pink-50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Year Summary */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{currentYear}</h2>
          {getTotalPeriodDays(currentYear) > 0 ? (
            <p className="text-gray-600">
              You've conquered{" "}
              <span className="font-bold text-pink-600 text-xl">{getTotalPeriodDays(currentYear)}</span> period days
              like a queen! 👑
            </p>
          ) : (
            <p className="text-gray-600">Ready to track your period journey for {currentYear}! 🚀</p>
          )}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {MONTHS.map((month, index) => (
            <div
              key={`${currentYear}-${index}`}
              className="transform hover:scale-105 transition-transform duration-200"
            >
              {renderCalendar(currentYear, index)}
            </div>
          ))}
        </div>

        {/* Period Summary Statistics - Moved Below Calendar */}
        <div className="mb-8">
          <Card className="border-pink-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-pink-500" />
                {currentYear} Cycle Health Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {(() => {
                const cycleAnalysis = []
                let lastPeriodDate = null

                for (let month = 0; month < 12; month++) {
                  const periodDates = getPeriodDatesForMonth(currentYear, month)
                  if (periodDates.length > 0) {
                    const firstDayOfPeriod = Math.min(...periodDates)
                    const currentPeriodDate = new Date(currentYear, month, firstDayOfPeriod)

                    let cycleDays = null
                    let healthStatus = ""
                    let healthColor = ""

                    if (lastPeriodDate) {
                      const timeDiff = currentPeriodDate.getTime() - lastPeriodDate.getTime()
                      cycleDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24))

                      if (cycleDays >= 21 && cycleDays <= 35) {
                        healthStatus = "Healthy & Normal! 💚"
                        healthColor = "text-green-600 bg-green-50"
                      } else if (cycleDays >= 18 && cycleDays <= 40) {
                        healthStatus = "Pretty Good! 💛"
                        healthColor = "text-yellow-600 bg-yellow-50"
                      } else if (cycleDays < 18) {
                        healthStatus = "A bit short, but okay! 🧡"
                        healthColor = "text-orange-600 bg-orange-50"
                      } else {
                        healthStatus = "A bit long, monitor it! 💙"
                        healthColor = "text-blue-600 bg-blue-50"
                      }
                    }

                    cycleAnalysis.push({
                      month: MONTHS[month],
                      cycleDays,
                      healthStatus,
                      healthColor,
                    })

                    lastPeriodDate = currentPeriodDate
                  }
                }

                return cycleAnalysis.length > 0 ? (
                  <div className="space-y-2">
                    {cycleAnalysis.map((analysis, index) => (
                      <div key={analysis.month} className="p-3 bg-pink-50 rounded-lg border border-pink-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-1">{analysis.month}</h4>
                            {analysis.cycleDays ? (
                              <p className="text-sm text-gray-600 mb-1">
                                🩸 Got periods after{" "}
                                <span className="font-bold text-pink-600">{analysis.cycleDays} days</span>
                              </p>
                            ) : (
                              <p className="text-sm text-gray-600 mb-1">🩸 First tracked period of the year</p>
                            )}
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${analysis.healthColor}`}>
                            {analysis.healthStatus}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Health Tips */}
                    <div className="mt-3 p-3 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg border-2 border-pink-200">
                      <div className="text-center">
                        <h4 className="font-semibold text-gray-800 mb-1">💡 Cycle Health Tips</h4>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>
                            💚 <strong>21-35 days:</strong> Perfect normal cycle!
                          </p>
                          <p>
                            💛 <strong>18-40 days:</strong> Still within healthy range
                          </p>
                          <p>
                            🧡 <strong>Under 18 days:</strong> Consider tracking symptoms
                          </p>
                          <p>
                            💙 <strong>Over 40 days:</strong> Might want to consult a doctor
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No period data for {currentYear} yet! Start tracking to see your cycle health! 🌸
                  </p>
                )
              })()}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 bg-white rounded-xl p-6 border-2 border-pink-200">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-pink-500" />
            <p className="text-gray-600 font-medium">Your period data is stored locally and stays private!</p>
            <Sparkles className="h-5 w-5 text-pink-500" />
          </div>
          <p className="text-sm text-gray-500">Made with 💖 for Shravya. You're doing amazing! ✨</p>
        </div>
      </div>
    </div>
  )
}
