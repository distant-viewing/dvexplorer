library(tidyverse)
library(stringi)
library(jsonlite)

system("pandoc -i input.docx -o input.html")

# read the data as lines and add the page and part identifiers
df <- tibble(input = read_lines("input.html"))
df$pages <- NA_character_
idx <- stri_detect(df$input, fixed = "<h1")
df$pages[idx] <- stri_replace_all(df$input[idx], "", regex = "<[^>]+>")
df <- fill(df, pages)
df$parts <- NA_character_
idx <- stri_detect(df$input, fixed = "<h2")
df$parts[idx] <- stri_replace_all(df$input[idx], "", regex = "<[^>]+>")
df <- fill(df, parts)
df$parts[is.na(df$parts)] <- "all"
df <- filter(df, !stri_detect(input, regex = "<h[12]"))

# paste the data into the text for each section
df <- df |>
  group_by(pages, parts) |>
  summarize(input = paste(input, collapse = "\n")) |>
  ungroup()

# save the individual model pages
pset <- setdiff(unique(df$pages), c("welcome", "started", "moreinfo", "citation"))
for (i in seq_along(pset))
{
  out <- list(
    "short" = unbox(df$input[(df$parts == "short") & (df$pages == pset[i])]),
    "long" = unbox(df$input[(df$parts == "long") & (df$pages == pset[i])])
  )
  write_json(out, file.path('../info', paste0(pset[i], ".json")))
}

# add extra info to the front pages
df$input[df$pages == "welcome"] <- paste(c(
  "<div style='position: relative; padding-below: 60px; border-bottom:",
  " 4px solid black'><a href='https://distantviewing.org' target='_blank'",
  " rel='noopener noreferrer'><img src='./icon/icon_gi.png'",
  "style='height: 160px'></a></div><br>",
  df$input[df$pages == "welcome"],
  "<p><span><strong>Taylor Arnold</strong></span> <br />",
  " <span><strong>Lauren Tilton</strong></span> <br />",
  " <span>Directors, Distant Viewing Lab, University of Richmond</span></p>"
), collapse = "")

df$input[df$pages == "started"] <- paste(c(
  "<h2>1.1 Getting Started</h2>",
  df$input[df$pages == "started"]
), collapse = "")

df$input[df$pages == "moreinfo"] <- paste(c(
  "<h2>1.2 Further Resources</h2>",
  df$input[df$pages == "moreinfo"]
), collapse = "")

df$input[df$pages == "citation"] <- paste(c(
  '<h2>1.3 Citation + Funding</h2>',
  df$input[df$pages == "citation"],
  '<blockquote>Taylor Arnold and Lauren Tilon, <i>Distant Viewing Explorer</i>',
  ' (2025). https://distantviewing.org/dvexplorer</blockquote></p><br>',
  '<p>The Distant Viewing GUI is funded with generous support from:</p>',
  '</div> <div class="photo-row">',
  '<a href="https://www.mellon.org/" target="_blank" rel="noopener noreferrer">',
  '<img src="../../icon/mellon_logo.png" alt="Mellon Foundation" />',
  '</a> <a href="https://www.neh.gov/" target="_blank" rel="noopener noreferrer">',
  '<img src="../../icon/neh_logo.jpg" alt="National Endowement for the Humanities" />',
  '</a> </div>'
), collapse = "")

# save the front pages
pset <- c("welcome", "started", "moreinfo", "citation")
for (i in seq_along(pset))
{
  out <- list(
    "text" = unbox(df$input[(df$pages == pset[i])])
  )
  write_json(out, file.path('../info', paste0(pset[i], ".json")))
}


