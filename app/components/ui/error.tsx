export default function Error({ id, error }: { id?: string; error: string }) {
	return (
		<p id={id} className="text-red-500">
			{error}
		</p>
	)
}
