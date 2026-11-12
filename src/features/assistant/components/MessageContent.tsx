import { isNumeric, parseBlocks, parseInline } from '@/features/assistant/lib'
import { cn } from '@/shared/lib/utils'

function Inline({ text }: { text: string }) {
  return parseInline(text).map((segment, index) => {
    if (segment.type === 'bold') {
      return (
        <strong key={index} className="font-bold">
          {segment.text}
        </strong>
      )
    }
    if (segment.type === 'number') {
      return (
        <span key={index} className="font-mono">
          {segment.text}
        </span>
      )
    }
    return segment.text
  })
}

export function MessageContent({ content }: { content: string }) {
  return (
    <div className="flex flex-col gap-2.5 text-ui-lg">
      {parseBlocks(content).map((block, index) => {
        if (block.type === 'paragraph') {
          return (
            <p key={index} className="whitespace-pre-line">
              <Inline text={block.text} />
            </p>
          )
        }
        if (block.type === 'list') {
          return (
            <ul key={index} className="flex list-disc flex-col gap-1 pl-5">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <Inline text={item} />
                </li>
              ))}
            </ul>
          )
        }
        const numeric = block.header.map((_, column) =>
          block.rows.every((row) => !row[column] || isNumeric(row[column])),
        )
        return (
          <div key={index} className="overflow-x-auto border border-border-strong">
            <table className="w-full min-w-max border-collapse">
              <thead>
                <tr>
                  {block.header.map((cell, column) => (
                    <th
                      key={column}
                      scope="col"
                      className={cn(
                        'h-7 border-b px-3 text-left text-label font-medium uppercase text-tertiary',
                        numeric[column] && column > 0 && 'text-right',
                      )}
                    >
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b last:border-b-0">
                    {block.header.map((_, column) => (
                      <td
                        key={column}
                        className={cn(
                          'h-8 whitespace-nowrap px-3 text-data',
                          numeric[column] && 'font-mono',
                          numeric[column] && column > 0 && 'text-right',
                        )}
                      >
                        <Inline text={row[column] ?? ''} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      })}
    </div>
  )
}
