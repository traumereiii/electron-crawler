export default function PageTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <h1 className="text-slate-900 font-bold text-2xl">{title}</h1>
      <p className="text-slate-600 mt-1">{description || ''}</p>
    </div>
  )
}
