import React, { useState, useEffect, useCallback } from 'react'
import { graphql } from 'gatsby'
import queryString from 'query-string'
import { Search } from '../components/search'
import { Link } from 'gatsby'

import _ from 'lodash'
import { Head } from '../components/head'
import { Layout } from '../layout'

export const Post = ({ post }) => {
  return (
    <>
      <div>
        <Link to={post.node.fields.slug}>
          <h1>{post.node.frontmatter.title}</h1>
          <h2>{post.node.frontmatter.date}</h2>
          <span>{post.node.excerpt}</span>
        </Link>
      </div>
    </>
  )
}

export default ({ data, location }) => {
  const posts = data.allMarkdownRemark.edges ? data.allMarkdownRemark.edges : []
  const [state, setState] = useState({
    query: '',
    filteredData: [],
  })

  const handleChange = query => {
    if (query.trim() === state.query.trim()) {
      setState({
        ...state,
        query,
      })
      return
    }
    searchPost(query)
  }

  const searchPost = useCallback(
    query => {
      if (query.trim() === '') {
        setState({
          query,
          filteredData: [],
        })
        return
      }
      const posts = data.allMarkdownRemark.edges || []

      const filteredData = posts.filter(post => {
        const searchQuery = query.toLowerCase().trim()
        const {
          excerpt,
          frontmatter: { title },
        } = post.node
        return (
          (excerpt && excerpt.toLowerCase().includes(searchQuery)) ||
          (title && title.toLowerCase().includes(searchQuery))
        )
      })
      setState(() => {
        return {
          query: query,
          filteredData: filteredData,
        }
      })
    },
    [posts]
  )

  useEffect(() => {
    if (location.href) {
      const {
        query: { query },
      } = queryString.parseUrl(location.href)
      searchPost(query ? query : '')
    }
  }, [searchPost, location.href])

  const siteTitle = data.site.siteMetadata.title

  return (
    <Layout location={location} title={siteTitle}>
      <Head title="search" />
      <div>
        <Search
          value={state.query}
          onChange={e => handleChange(e.target.value)}
          location={location}
        />
        {state.filteredData.map((post, index) => {
          return <Post post={post} key={`post_${index}`} />
        })}
      </div>
    </Layout>
  )
}

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { category: { ne: null }, draft: { eq: false } } }
    ) {
      edges {
        node {
          excerpt(pruneLength: 200, truncate: true)
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD YYYY")
            title
            category
            draft
          }
        }
      }
    }
  }
`
