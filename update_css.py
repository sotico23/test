import sys

file_path = "/home/sotico/Escritorio/Laravel/try/resources/js/pages/Backend/Prospectos/Index.tsx"
with open(file_path, "r") as f:
    content = f.read()

# Replace filters padding
content = content.replace('className="mb-4 flex flex-wrap gap-2 rounded-lg bg-muted/30 p-3"', 'className="mb-4 flex flex-wrap gap-2 rounded-lg bg-muted/30 p-2"')

# Make Inputs & Selects smaller in filters
content = content.replace('className="w-[100px]"', 'className="h-8 w-[90px] text-xs"')
content = content.replace('className="w-[140px]"', 'className="h-8 w-[120px] text-xs"')
content = content.replace('className="pl-8"', 'className="h-8 pl-8 text-xs"')
content = content.replace('className="flex h-10 rounded-md border bg-background px-3 py-2"', 'className="flex h-8 rounded-md border bg-background px-2 py-1 text-xs"')
content = content.replace('className="flex h-10 w-full rounded-md border bg-background px-3 py-2 capitalize"', 'className="flex h-9 w-full rounded-md border bg-background px-2 py-1 text-sm capitalize"')

# Replace table styles
content = content.replace('<table className="w-full">', '<table className="w-full text-sm">')

# Table Headings
content = content.replace('className="px-4 py-3 text-left font-medium whitespace-nowrap"', 'className="px-2 py-2 text-left font-medium"')
content = content.replace('className="px-4 py-3 text-left font-medium hidden md:table-cell whitespace-nowrap"', 'className="px-2 py-2 text-left font-medium hidden md:table-cell"')
content = content.replace('className="px-4 py-3 text-left font-medium hidden sm:table-cell whitespace-nowrap"', 'className="px-2 py-2 text-left font-medium hidden sm:table-cell"')
content = content.replace('className="px-4 py-3 text-left font-medium hidden lg:table-cell whitespace-nowrap"', 'className="px-2 py-2 text-left font-medium hidden lg:table-cell"')
content = content.replace('className="px-4 py-3 text-right font-medium hidden lg:table-cell whitespace-nowrap"', 'className="px-2 py-2 text-right font-medium hidden lg:table-cell"')
content = content.replace('className="px-4 py-3 text-center font-medium whitespace-nowrap"', 'className="px-2 py-2 text-center font-medium"')
content = content.replace('className="px-4 py-3 text-right font-medium whitespace-nowrap"', 'className="px-2 py-2 text-right font-medium"')

# Table Body
content = content.replace('className="px-4 py-3 font-medium whitespace-nowrap"', 'className="px-2 py-2 font-medium"')
content = content.replace('className="px-4 py-3 whitespace-nowrap"', 'className="px-2 py-2"')
content = content.replace('className="px-4 py-3 hidden md:table-cell whitespace-nowrap"', 'className="px-2 py-2 hidden md:table-cell max-w-[200px] truncate"')
content = content.replace('className="px-4 py-3 hidden sm:table-cell whitespace-nowrap"', 'className="px-2 py-2 hidden sm:table-cell max-w-[200px] truncate"')
content = content.replace('className="px-4 py-3 hidden lg:table-cell whitespace-nowrap"', 'className="px-2 py-2 hidden lg:table-cell"')
content = content.replace('className="px-4 py-3 text-right hidden lg:table-cell whitespace-nowrap text-green-600 font-bold"', 'className="px-2 py-2 text-right hidden lg:table-cell whitespace-nowrap text-green-600 font-bold"')
content = content.replace('className="px-4 py-3 text-center whitespace-nowrap"', 'className="px-2 py-2 text-center whitespace-nowrap"')
content = content.replace('className="px-4 py-2 text-right whitespace-nowrap"', 'className="px-2 py-2 text-right whitespace-nowrap"')

# Reduce button size in table actions
content = content.replace('<Pencil className="h-4 w-4" />', '<Pencil className="h-3.5 w-3.5" />')
content = content.replace('<Trash2 className="h-4 w-4" />', '<Trash2 className="h-3.5 w-3.5" />')

# Bagdes in getEstadoBadge
content = content.replace("<Badge className={colores[estado] || 'bg-gray-500'}>{estado}</Badge>", "<Badge className={`${colores[estado] || 'bg-gray-500'} text-[10px] h-5 px-1.5 uppercase`}>{estado}</Badge>")

with open(file_path, "w") as f:
    f.write(content)
