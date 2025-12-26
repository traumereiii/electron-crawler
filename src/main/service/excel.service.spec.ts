import { ExcelService } from '@main/service/excel.service'

describe('ExcelService', () => {
  const service: ExcelService = new ExcelService()

  it('should be defined', () => {
    service.setHeaders([
      {
        label: '이름',
        key: 'name',
        width: 20,
        fontWeight: 'bold',
        backgroundColor: '#0000FF',
        color: '#ffffff'
      },
      {
        label: '나이',
        key: 'age',
        width: 10,
        fontWeight: 'normal',
        backgroundColor: '#FFFF00',
        color: '#000000'
      }
    ])

    service.create<{ name: string; age: number }>('테스트.xlsx', [
      { name: '홍길동', age: 30 },
      { name: '김철수', age: 25 }
    ])
  })
})
