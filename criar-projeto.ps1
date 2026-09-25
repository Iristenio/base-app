# ============================================================================
#  Cria um projeto novo a partir desta base.
#
#  Interativo (pergunta tudo):
#    powershell -ExecutionPolicy Bypass -File D:\03-PESSOAL\_BASE-APP\criar-projeto.ps1
#
#  Com parametros (sem perguntas - usado pela skill /novo-app do Claude):
#    ... criar-projeto.ps1 -Nome "Controle de Estoque" -NomeCurto "Estoque" -Pasta "CONTROLE-ESTOQUE" `
#        -Destino "D:\03-PESSOAL" -Dispositivos "celular,pc" -Cor "#2f6fed"
# ============================================================================
param(
  [string]$Nome,
  [string]$NomeCurto,
  [string]$Pasta,
  [string]$Destino,
  [string]$Dispositivos,
  [string]$Cor
)
$ErrorActionPreference = 'Stop'
$base = $PSScriptRoot
$utf8 = New-Object System.Text.UTF8Encoding($false)

function Ler-Texto($caminho) { [IO.File]::ReadAllText($caminho, $utf8) }
function Gravar-Texto($caminho, $texto) { [IO.File]::WriteAllText($caminho, $texto, $utf8) }

Write-Host ''
Write-Host '=== Novo projeto a partir da base ===' -ForegroundColor Cyan
Write-Host ''

# 1. Nome
$nome = if ($Nome) { $Nome } else { Read-Host 'Nome do app (ex.: Controle de Estoque)' }
if (-not $nome.Trim()) { throw 'Informe um nome.' }
$sugestaoPasta = ($nome.Trim().ToUpper() -replace '[^A-Z0-9]+', '-').Trim('-')
$pasta = if ($Pasta) { $Pasta } else { Read-Host "Nome da pasta [$sugestaoPasta]" }
if (-not $pasta.Trim()) { $pasta = $sugestaoPasta }
$nomeCurto = if ($NomeCurto) { $NomeCurto } elseif ($Nome) { '' } else { Read-Host "Nome curto, embaixo do icone (ate 12 letras) [$($nome.Trim().Split(' ')[0])]" }
if (-not $nomeCurto.Trim()) { $nomeCurto = $nome.Trim().Split(' ')[0] }

# 2. Dispositivos
if ($Dispositivos) {
  $escolha = $Dispositivos
} else {
  Write-Host ''
  Write-Host 'Em quais dispositivos o app sera usado?'
  Write-Host '  1 = Tablet   2 = Celular   3 = PC'
  Write-Host '  Exemplos: "2" (so celular), "2,3" (celular e PC), "1,2,3" (todos)'
  $escolha = Read-Host 'Dispositivos [1,2,3]'
}
if (-not $escolha.Trim()) { $escolha = '1,2,3' }
# Aceita números (1,2,3) ou nomes (tablet, celular, pc)
$mapa = @{ '1' = 'tablet'; '2' = 'celular'; '3' = 'pc'; 'tablet' = 'tablet'; 'celular' = 'celular'; 'pc' = 'pc' }
$listaDisp = @($escolha.ToLower() -split '[,; ]+' | Where-Object { $mapa.ContainsKey($_) } | ForEach-Object { $mapa[$_] } | Select-Object -Unique)
if ($listaDisp.Count -eq 0) { throw 'Escolha pelo menos um dispositivo (1, 2 ou 3).' }

# 3. Cor
$cor = if ($Cor) { $Cor } elseif ($Nome) { '' } else { Read-Host 'Cor principal em hexadecimal [#2f6fed]' }
if (-not ($cor -match '^#[0-9a-fA-F]{6}$')) { $cor = '#2f6fed' }

# 4. Onde criar
$paiPadrao = Split-Path $base -Parent
$pai = if ($Destino) { $Destino } elseif ($Nome) { $paiPadrao } else { Read-Host "Criar dentro de qual pasta? [$paiPadrao]" }
if (-not $pai.Trim()) { $pai = $paiPadrao }
if (-not (Test-Path $pai)) { New-Item -ItemType Directory -Force $pai | Out-Null }
$destino = Join-Path $pai $pasta
if (Test-Path $destino) { throw "A pasta $destino ja existe." }

Write-Host ''
Write-Host "Criando $destino ..." -ForegroundColor Cyan
robocopy $base $destino /E /XD node_modules dist dev-dist .git /XF criar-projeto.ps1 .clasp.json /NFL /NDL /NJH /NJS /NP | Out-Null

# 5. Personaliza
$cfg = Join-Path $destino 'app\src\app.config.ts'
$t = Ler-Texto $cfg
$lista = ($listaDisp | ForEach-Object { "'$_'" }) -join ', '
$t = $t -replace "nome: '[^']*'", "nome: '$($nome.Trim() -replace "'", "\'")'"
$t = $t -replace "nomeCurto: '[^']*'", "nomeCurto: '$($nomeCurto.Trim() -replace "'", "\'")'"
$t = $t -replace "corPrimaria: '[^']*'", "corPrimaria: '$cor'"
$t = $t -replace "dispositivos: \[[^\]]*\]", "dispositivos: [$lista]"
Gravar-Texto $cfg $t

$pkg = Join-Path $destino 'app\package.json'
Gravar-Texto $pkg ((Ler-Texto $pkg) -replace '"name": "[^"]*"', ('"name": "' + $pasta.ToLower() + '"'))

$conf = Join-Path $destino 'backend\configurar.js'
Gravar-Texto $conf ((Ler-Texto $conf) -replace "var NOME_PLANILHA = '[^']*'", "var NOME_PLANILHA = '$($nome.Trim()) - dados'")

$readme = "# $($nome.Trim())`n`nCriado a partir da base (_BASE-APP). Dispositivos: $($listaDisp -join ', ').`n`nVeja COMO-USAR.md, DESIGN.md e ARQUITETURA.md.`n"
Gravar-Texto (Join-Path $destino 'README.md') $readme

# 6. Git + dependências
Push-Location $destino
git init -b main | Out-Null
Push-Location app
Write-Host 'Instalando dependencias (1-2 minutos)...' -ForegroundColor Cyan
npm install --no-fund --no-audit | Out-Null
Pop-Location
# Autor dos commits: usa o configurado no computador; se não houver, o mesmo da base
if (-not (git config user.name)) {
  $autor = git -C $base config user.name
  $email = git -C $base config user.email
  if ($autor) { git config user.name $autor; git config user.email $email }
}
git add -A | Out-Null
git commit -q -m "Projeto criado a partir da base ($($listaDisp -join ', '))" | Out-Null
Pop-Location

Write-Host ''
Write-Host "Pronto! Projeto criado em $destino" -ForegroundColor Green
Write-Host "Dispositivos: $($listaDisp -join ', ')"
Write-Host ''
Write-Host 'Proximos passos:'
Write-Host "  1. Abra a pasta $destino no Claude Code e descreva o app que voce quer."
Write-Host '  2. Para ver funcionando no PC:  cd app  e depois  npm run dev'
Write-Host '  3. Guia completo: COMO-USAR.md'
