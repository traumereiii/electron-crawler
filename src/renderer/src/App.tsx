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

  useEffect(() => {})

  const handleButton6 = async () => {
    // await window.$renderer.request(IPC_EVENT_KEYS.request.get.test, { info: 'button6 clicked' })
    await window.$renderer.onReceive('realtime:event', (_, payload) => {
      console.log('isBlank Test:', 'hello'.isBlank())
      console.log('realtime event received: ', payload)
      throw new Error('렌더러 에러 테스트')
      // setEvents((prevEvents) => [payload, ...prevEvents].slice(0, 20))
    })
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
          <Button onClick={handleButton6}>버튼 6</Button>
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
