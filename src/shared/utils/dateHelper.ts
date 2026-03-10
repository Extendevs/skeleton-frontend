import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export const displayFormatDate = (dateStr: string | null | undefined, formatD: 'medium' | 'mediumDate' = 'medium') => {
    if (!dateStr) {
        return ''
    }

    try {
        // Parse ISO string which handles timezone correctly
        let date = parseISO(dateStr)

        // If parsing fails, try with Date constructor
        if (isNaN(date.getTime())) {
            date = new Date(dateStr)
        }

        // Validate the date
        if (isNaN(date.getTime())) {
            return ''
        }

        // For date-only formatting, adjust to local timezone to prevent day shift
        // This ensures "2025-11-25T00:00:00.000Z" displays as Nov 25, not Nov 24
        if (formatD === 'mediumDate') {
            // Extract only the date parts (YYYY-MM-DD) and create a local date
            // Handles both ISO format (with T) and simple date format
            const dateMatch = dateStr.match(/^(\d{4}-\d{2}-\d{2})/)
            if (dateMatch && dateMatch[1]) {
                const [year, month, day] = dateMatch[1].split('-').map(Number)
                // Create date in local timezone to prevent UTC to local conversion issues
                date = new Date(year, month - 1, day)
            }
        }

        switch (formatD) {
            case 'medium':
                return format(date, 'MMM d, yyyy HH:mm', { locale: es })
            case 'mediumDate':
                return format(date, 'MMM d, yyyy', { locale: es })
            default:
                return format(date, 'MMM d, yyyy HH:mm', { locale: es })
        }
    } catch (error) {
        console.error('Error formatting date:', dateStr, error)
        return ''
    }
}

export const formatDateForInput = (dateStr?: string) => {
    if (!dateStr) return ''
    try {
        const dateMatch = dateStr.match(/^(\d{4}-\d{2}-\d{2})/)
        if (dateMatch?.[1]) {
            return dateMatch[1]
        }
        return format(parseISO(dateStr), 'yyyy-MM-dd')
    } catch (error) {
        console.error('Error parsing date:', dateStr, error)
        return ''
    }
}