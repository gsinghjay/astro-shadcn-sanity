GET_PAGES = """
*[_type == "page" && ($site == "" || site == $site)] {
  _id,
  title,
  "slug": slug.current,
  blocks
}
"""