import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'
import { Button } from '@renderer/components/ui/button'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

function App(): React.JSX.Element {
  const [email, setEmail] = useState('')
  const [users, setUsers] = useState<any[]>([])
  const [message, setMessage] = useState('')
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    const unsubscribe = window.api.onError(({ message }) => {
      console.log(message)
      toast.error(message, {
        style: { color: 'red' },
        position: 'top-center'
      })
    })

    // ✅ 컴포넌트 언마운트 시 구독 해제
    return () => unsubscribe()
  }, [])

  const handleButton1 = () => {
    console.log('handleButton1 clicked')
    window.electron.ipcRenderer.send('action1', email)
    setEmail('')
  }
  const handleButton2 = async () => {
    console.log('handleButton2 clicked')
    const response = await window.electron.ipcRenderer.invoke('action2', {
      data: 'button2 clicked'
    })
    console.log('response: ', response)
    setUsers(response.users)
  }

  const handleButton3 = async () => {
    const response = await window.electron.ipcRenderer.invoke('action3', {
      data: 'button2 clicked'
    })
    console.log('response: ', response)
    setMessage(response.message)
  }

  const handleButton4 = async () => {
    await window.api.realtimeStart()
  }

  const handleButton5 = async () => {
    await window.api.realtimeStop()
  }

  return (
    <>
      <img alt="logo" className="logo" src={electronLogo} />
      <div className="creator">Powered by electron-vite</div>
      <div className="text">
        Build an Electron app with <span className="react">React</span>
        &nbsp;and <span className="ts">TypeScript</span>
      </div>
      <p className="tip">
        Please try pressing <code>F12</code> to open the devTool
      </p>
      <div>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-white text-black"
        />
      </div>
      <div className="actions">
        <div className="flex gap-3">
          <Button onClick={handleButton1}>버튼 1</Button>
          <Button onClick={handleButton2}>버튼 2</Button>
          <Button onClick={handleButton3}>버튼 3</Button>
          <Button onClick={handleButton4}>버튼 4</Button>
          <Button onClick={handleButton5}>버튼 5</Button>
        </div>
      </div>

      <div className="bg-white">
        <span className="text-black">{'users: ' + JSON.stringify(users)}</span>
      </div>

      <div className="bg-white text-black">{'message: ' + message}</div>

      <div style={{ marginTop: 16, textAlign: 'left' }}>
        {events.map((e, i) => (
          <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid #333' }}>
            <b>{e.type}</b> | {e.time} | random={e.ramdom}
          </div>
        ))}
      </div>

      <Versions></Versions>
    </>
  )
}

export default App
