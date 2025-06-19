import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday } from 'date-fns'
import { ja } from 'date-fns/locale'

/**
 * 日付を日本語形式でフォーマット
 */
export function formatDateJa(date: Date | string, formatStr: string = 'yyyy年M月d日'): string {
  return format(new Date(date), formatStr, { locale: ja })
}

/**
 * 相対的な日付表現を取得
 */
export function getRelativeDateLabel(date: Date | string): string {
  const targetDate = new Date(date)
  
  if (isToday(targetDate)) {
    return '今日'
  }
  
  if (isTomorrow(targetDate)) {
    return '明日'
  }
  
  if (isYesterday(targetDate)) {
    return '昨日'
  }
  
  return formatDistanceToNow(targetDate, { 
    addSuffix: true, 
    locale: ja 
  })
}

/**
 * 支払い期日の表示用ラベルを生成
 */
export function getBillingDateLabel(nextBillingDate: Date | string): string {
  const date = new Date(nextBillingDate)
  const daysUntil = Math.ceil(
    (date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )
  
  if (daysUntil < 0) {
    return `${Math.abs(daysUntil)}日前`
  }
  
  if (daysUntil === 0) {
    return '今日'
  }
  
  if (daysUntil === 1) {
    return '明日'
  }
  
  if (daysUntil <= 7) {
    return `${daysUntil}日後`
  }
  
  if (daysUntil <= 30) {
    const weeks = Math.floor(daysUntil / 7)
    return `約${weeks}週間後`
  }
  
  const months = Math.floor(daysUntil / 30)
  return `約${months}ヶ月後`
}

/**
 * 月の開始日と終了日を取得
 */
export function getMonthRange(date: Date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  
  return { start, end }
}

/**
 * 年の開始日と終了日を取得
 */
export function getYearRange(date: Date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 1)
  const end = new Date(date.getFullYear(), 11, 31)
  
  return { start, end }
}