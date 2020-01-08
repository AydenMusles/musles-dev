const each = require('lodash/each')
const Promise = require('bluebird')
const path = require('path')

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions
  const indexPage = path.resolve('./src/pages/index.js')
  createPage({
    path: `posts`,
    component: indexPage,
  })

  return new Promise((resolve, reject) => {
    const blogPost = path.resolve('./src/templates/blog-post.js')
    resolve(
      graphql(
        `
          {
            allCosmicjsPosts(sort: { fields: [created], order: DESC }, limit: 1000) {
              edges {
                node {
                  slug,
                  title
                }
              }
            }
          }
        `
      ).then(result => {
        if (result.errors) {
          console.log(result.errors)
          reject(result.errors)
        }

        // Create blog posts pages.
        const posts = result.data.allCosmicjsPosts.edges;

        each(posts, (post, index) => {
          const next = index === posts.length - 1 ? null : posts[index + 1].node;
          const previous = index === 0 ? null : posts[index - 1].node;

          createPage({
            path: `posts/${post.node.slug}`,
            component: blogPost,
            context: {
              slug: post.node.slug,
              previous,
              next,
            },
          })
        })
      })
    )
  })
}
const path = require(`path`)
exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions
  // Query for all products in Shopify
  const result = await graphql(`
    query {
      allShopifyProduct(sort: { fields: [title] }) {
        edges {
          node {
            title
            images {
              originalSrc
            }
            shopifyId
            handle
            description
            availableForSale
            priceRange {
              maxVariantPrice {
                amount
              }
              minVariantPrice {
                amount
              }
            }
          }
        }
      }
    }
  `)
  // Iterate over all products and create a new page using a template
  // The product "handle" is generated automatically by Shopify
  result.data.allShopifyProduct.edges.forEach(({ node }) => {
    createPage({
      path: `/product/${node.handle}`,
      component: path.resolve(`./src/templates/product.js`),
      context: {
        product: node,
      },
    })
  })
}
