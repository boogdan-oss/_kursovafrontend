import { usePairOptions } from '@/shared/api/queries/market'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { useFiltersStore } from '@/store/useFiltersStore'

export function PairSelect() {
  const asset = useFiltersStore((state) => state.asset)
  const fiat = useFiltersStore((state) => state.fiat)
  const setPair = useFiltersStore((state) => state.setPair)
  const setBank = useFiltersStore((state) => state.setBank)
  const { assets, fiats } = usePairOptions(asset, fiat)
  const pair = `${asset}/${fiat}`
  const options = [
    ...new Set([
      pair,
      ...assets.map((code) => `${code}/${fiat}`),
      ...fiats.map((code) => `${asset}/${code}`),
    ]),
  ]

  return (
    <Select
      value={pair}
      onValueChange={(value) => {
        const [nextAsset, nextFiat] = value.split('/')
        if (nextFiat !== fiat) setBank(null)
        setPair(nextAsset, nextFiat)
      }}
    >
      <SelectTrigger
        aria-label="Пара"
        className="h-auto w-auto gap-1 border-0 bg-transparent p-0 text-ui-lg font-semibold focus:ring-0 [&>svg]:size-3.5"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option.replace('/', ' / ')}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
