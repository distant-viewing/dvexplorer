# The html pages and the javascript files in js/pages
# are created from template files ; use this script to
# generate the files

library(stringi)
library(readr)

##############################################################################
# A. SETUP

# warning message
msg <- "DO NOT EDIT THIS PAGE DIRECTLY; IT WAS CREATED WITH create_html_js.R"

# load the template files
template_html <- read_lines("templates/template.html")
template_anno <- read_lines("templates/template_anno.js")
template_text <- read_lines("templates/template_text.js")

# these are the names of the pages
page_anno <- c(
  "caption",  "classify", "depth", "diarization", "embed",
  "mask",  "object", "segment", "sentiment", "shotboundary",
  "stars",  "toxic", "transcription", "zeroshot", "metrics",
  "color"
)
page_text <- c("citation", "moreinfo", "started")
page_index <- "welcome"

##############################################################################
# B. CREATE HTML PAGES

# 1. Create the welcome page; it is a bit special because it 
# lives in the root of the page and therefore needs a different
# path and output location
x <- template_html
x <- stri_replace_all(x, ".", fixed = "{{PATH}}")
x <- stri_replace_all(x, "welcome", fixed = "{{PAGE}}")
x <- stri_replace_all(x, msg, fixed = "{{MESSAGE}}")
write_lines(x, "index.html")

# 2. Create the other html pages; they are all the same format
page_html <- c(page_text, page_anno)
for (i in seq_along(page_html)) {
  pg <- page_html[i]
  x <- template_html
  x <- stri_replace_all(x, "../..", fixed = "{{PATH}}")
  x <- stri_replace_all(x, pg, fixed = "{{PAGE}}")
  x <- stri_replace_all(x, msg, fixed = "{{MESSAGE}}")
  write_lines(x, file.path("pages", pg, "index.html"))
}

##############################################################################
# C. CREATE JS FILES

# 1. create the welcome-page javascript file
x <- template_text
x <- stri_replace_all(x, ".", fixed = "{{PATH}}")
x <- stri_replace_all(x, "welcome", fixed = "{{PAGE}}")
x <- stri_replace_all(x, msg, fixed = "{{MESSAGE}}")
x <- stri_replace_all(x, "true", fixed = "{{ISROOT}}")
write_lines(x, file.path("js", "pages", paste0("welcome", ".js")))

# 2. create the other text-based javascript files
for (i in seq_along(page_text)) {
  pg <- page_text[i]
  x <- template_text
  x <- stri_replace_all(x, "../..", fixed = "{{PATH}}")
  x <- stri_replace_all(x, pg, fixed = "{{PAGE}}")
  x <- stri_replace_all(x, msg, fixed = "{{MESSAGE}}")
  x <- stri_replace_all(x, "false", fixed = "{{ISROOT}}")
  write_lines(x, file.path("js", "pages", paste0(pg, ".js")))
}

# 3. create the annotation javascript files
for (i in seq_along(page_anno)) {
  pg <- page_anno[i]
  pgcap <- stri_trans_totitle(pg)
  x <- template_anno
  x <- stri_replace_all(x, pg, fixed = "{{PAGE}}")
  x <- stri_replace_all(x, pgcap, fixed = "{{PAGECAP}}")
  x <- stri_replace_all(x, msg, fixed = "{{MESSAGE}}")
  write_lines(x, file.path("js", "pages", paste0(pg, ".js")))
}
