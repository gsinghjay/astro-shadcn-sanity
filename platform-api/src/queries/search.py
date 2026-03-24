SEARCH_QUERY = """
*[
  _type in $types 
  && ($site == "" || site == $site) 
  && [title, name, description] match $searchTerm
] | score([title, name] match $searchTerm) | order(_score desc)[0...10]{
  _id, _type, title, name, _score
}
"""