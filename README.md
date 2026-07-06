# ReklamaStroy Designer v3.18 — GitHub Pages clean upload

В архиве полный чистый проект конструктора для загрузки в GitHub.

Что включено:
- актуальный код конструктора;
- исправленная PDF-шапка;
- рамка вместо верхней шапки конструктора;
- точные размеры и стрелки;
- размещение логотипа слева/справа/сверху/снизу;
- загрузка логотипа PNG/SVG/PDF;
- галочка «Центрировать вторую строку»;
- готовый workflow `.github/workflows/deploy.yml` для GitHub Pages.

Важно для GitHub Pages:
- репозиторий должен быть Public, если используется бесплатный GitHub Free;
- в `Settings → Pages` нужно выбрать `Source: GitHub Actions`;
- после загрузки файлов workflow сам соберет проект и опубликует сайт.

Адрес после публикации:
`https://pokemonzhukovsky.github.io/reklamastroy-designer/`

Для Tilda / сайта:
```html
<div style="width:100%; max-width:100%; margin:0 auto;">
  <iframe
    src="https://pokemonzhukovsky.github.io/reklamastroy-designer/"
    style="width:100%; height:920px; border:0; display:block;"
    loading="lazy"
    allow="clipboard-write">
  </iframe>
</div>
```

Build command:
`npm run build`

Build output directory:
`dist`
