import { Injectable } from '@nestjs/common'
import * as ExcelJS from 'exceljs'
import { dialog } from 'electron'
import { format } from 'date-fns'
import { getLocalDate } from '@main/lib/utils'

export interface ExcelHeader extends CellStyle {
  label: string // 화면에 표시될 이름
  key: string // 데이터의 속성
}

export interface CellStyle {
  width?: number // 열 너비
  height?: number // 행 높이
  fontSize?: number
  fontWeight?: 'normal' | 'bold'
  color?: string
  backgroundColor?: string
  alignment?: 'left' | 'center' | 'right'
  useThousandsSeparator?: boolean // 천 단위 구분자 사용 여부 (기본값: true)
}

export function defaultExcelFileName() {
  return `${format(getLocalDate(), 'yyyyMMdd_HHmmss')}.xlsx`
}

@Injectable()
export class ExcelService {
  private headers: ExcelHeader[] = [
    {
      label: '종목 코드',
      key: 'code',
      width: 10,
      height: 30,
      fontWeight: 'bold',
      backgroundColor: '#008800',
      color: '#ffffff'
    },
    {
      label: '종목명',
      key: 'name',
      width: 20,
      height: 30,
      fontWeight: 'bold',
      backgroundColor: '#008800',
      color: '#ffffff'
    },
    {
      label: '현재가',
      key: 'price',
      width: 12,
      height: 30,
      fontWeight: 'bold',
      backgroundColor: '#008800',
      color: '#ffffff'
    },
    {
      label: '거래량',
      key: 'volume',
      width: 15,
      height: 30,
      fontWeight: 'bold',
      backgroundColor: '#008800',
      color: '#ffffff'
    },
    {
      label: '거래대금',
      key: 'tradingValue',
      width: 15,
      height: 30,
      fontWeight: 'bold',
      backgroundColor: '#008800',
      color: '#ffffff'
    },
    {
      label: '시가총액',
      key: 'marketCap',
      width: 15,
      height: 30,
      fontWeight: 'bold',
      backgroundColor: '#008800',
      color: '#ffffff'
    },
    {
      label: 'PER',
      key: 'per',
      width: 10,
      height: 30,
      fontWeight: 'bold',
      backgroundColor: '#008800',
      color: '#ffffff'
    }
  ]

  private cellStyles: { [key: string]: CellStyle } = {
    '2': {
      alignment: 'right',
      useThousandsSeparator: true
    },
    '3': {
      alignment: 'right',
      useThousandsSeparator: true
    },
    '4': {
      alignment: 'right',
      useThousandsSeparator: true
    },
    '5': {
      alignment: 'right',
      useThousandsSeparator: true
    },
    '6': {
      alignment: 'right',
      useThousandsSeparator: true
    }
  }

  /**
   * 헤더 설정
   * @param headers 엑셀 헤더 배열
   */
  setHeaders(headers: ExcelHeader[]): void {
    this.headers = headers
  }

  /**
   * 엑셀 파일 생성
   */
  async create<T>(data: T[], filePath?: string | null): Promise<string> {
    this.validateHeaders()

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Sheet1')

    this.setupHeaderRow(worksheet)
    this.addDataRows(worksheet, data)

    if (!filePath) {
      const savePath = await this.getSaveFilePath()
      filePath = filePath || savePath
    }

    await workbook.xlsx.writeFile(filePath)

    return filePath
  }

  /**
   * 헤더 유효성 검증
   */
  private validateHeaders(): void {
    if (this.headers.length === 0) {
      throw new Error('헤더가 설정되지 않았습니다. setHeaders()를 먼저 호출하세요.')
    }
  }

  /**
   * 헤더 행 설정 (컬럼 정의 + 스타일 적용)
   */
  private setupHeaderRow(worksheet: ExcelJS.Worksheet): void {
    // 컬럼 정의
    worksheet.columns = this.headers.map((header) => ({
      header: header.label,
      key: header.key,
      width: header.width || 15
    }))

    // 헤더 행 스타일 적용
    const headerRow = worksheet.getRow(1)
    this.headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 1)

      // 글자 스타일
      cell.font = {
        bold: header.fontWeight === 'bold',
        color: { argb: this.hexToArgb(header.color || '#000000') }
      }

      // 배경색
      if (header.backgroundColor) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: this.hexToArgb(header.backgroundColor) }
        }
      }

      // 정렬
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center'
      }

      // 테두리
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    })

    // 헤더 행 높이 설정
    const firstHeaderWithHeight = this.headers.find((h) => h.height)
    if (firstHeaderWithHeight?.height) {
      headerRow.height = firstHeaderWithHeight.height
    }
  }

  /**
   * 데이터 행 추가
   */
  private addDataRows<T>(worksheet: ExcelJS.Worksheet, data: T[]): void {
    data.forEach((item) => {
      const rowValues: any = {}
      this.headers.forEach((header) => {
        const value = item[header.key as keyof T]
        rowValues[header.key] = this.serializeValue(value)
      })
      const row = worksheet.addRow(rowValues)

      this.applyDataRowStyles(row)
    })
  }

  /**
   * BigInt와 Decimal을 직렬화 가능한 형태로 변환
   */
  private serializeValue(value: any): any {
    // BigInt 처리 - Number로 변환하여 숫자 포맷 적용 가능하게 함
    if (typeof value === 'bigint') {
      return Number(value)
    }

    // Prisma Decimal 타입 처리 (decimal.js)
    if (value && typeof value === 'object' && 'toNumber' in value) {
      return value.toNumber()
    }

    return value
  }

  /**
   * 데이터 행 스타일 적용 (열 기준)
   */
  private applyDataRowStyles(row: ExcelJS.Row): void {
    // 셀 스타일 적용 (각 열에 대해)
    row.eachCell((cell, colNumber) => {
      // colNumber는 1부터 시작하므로 index로 변환 (0부터)
      const columnIndex = colNumber - 1
      const columnStyle = this.cellStyles[columnIndex.toString()]

      // 기본 정렬 (가운데 정렬)
      cell.alignment = {
        vertical: 'middle',
        horizontal: columnStyle?.alignment || 'center'
      }

      // 기본 테두리
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }

      // 숫자 포맷 적용 (기본값: 천 단위 구분자 사용)
      if (typeof cell.value === 'number') {
        const useComma = columnStyle?.useThousandsSeparator !== false
        if (useComma) {
          // 정수면 #,##0, 소수점이 있으면 #,##0.00
          cell.numFmt = Number.isInteger(cell.value) ? '#,##0' : '#,##0.00'
        }
      }

      // cellStyles에 정의된 스타일 적용
      if (columnStyle) {
        // 폰트 스타일
        if (columnStyle.fontSize || columnStyle.fontWeight || columnStyle.color) {
          cell.font = {
            size: columnStyle.fontSize,
            bold: columnStyle.fontWeight === 'bold',
            color: columnStyle.color ? { argb: this.hexToArgb(columnStyle.color) } : undefined
          }
        }

        // 배경색
        if (columnStyle.backgroundColor) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: this.hexToArgb(columnStyle.backgroundColor) }
          }
        }
      }
    })
  }

  /**
   * 파일 저장 경로 선택
   */
  private async getSaveFilePath(): Promise<string> {
    const result = await dialog.showSaveDialog({
      title: '엑셀 파일 저장',
      defaultPath: defaultExcelFileName(),
      filters: [{ name: 'Excel Files', extensions: ['xlsx'] }]
    })

    if (result.canceled || !result.filePath) {
      throw new Error('파일 저장이 취소되었습니다.')
    }

    return result.filePath
  }

  /**
   * Hex 색상을 ARGB 형식으로 변환
   * @param hex Hex 색상 코드 (예: #FF0000)
   * @returns ARGB 문자열 (예: FFFF0000)
   */
  private hexToArgb(hex: string): string {
    // # 제거
    hex = hex.replace('#', '')

    // 3자리 hex를 6자리로 변환 (예: #F00 -> #FF0000)
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((char) => char + char)
        .join('')
    }

    // ARGB 형식으로 변환 (알파 채널 FF 추가)
    return `FF${hex.toUpperCase()}`
  }
}
