BEGIN {
    # split fields on commas but preserve commas within quoted strings
    # https://www.gnu.org/software/gawk/manual/html_node/Splitting-By-Content.html
    FPAT = "([^,]+)|(\"[^\"]+\")"

    # index of column to be removed (1-indexed, NOT 0-indexed)
    new_deaths_col = 6
}

{

    for (i = 1; i <= NF; i++) {
        if (i == new_deaths_col) {
          continue
        }
        printf("%s", $i)
        if (i != NF) {
          printf(",")
        }
    }

    printf("\n")

}