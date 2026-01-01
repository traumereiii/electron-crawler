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
  })
})
