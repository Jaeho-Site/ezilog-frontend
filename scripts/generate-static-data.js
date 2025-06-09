const fs = require('fs');
const path = require('path');
const axios = require('axios');

const API_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

async function generateStaticData() {
  try {
    console.log('🚀 정적 데이터 생성 시작...');
    
    // public/data 디렉토리 생성
    const dataDir = path.join(process.cwd(), 'public', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // 1. 카테고리 데이터 생성
    await generateCategoriesData(dataDir);
    
    // 2. 모든 포스트 데이터 생성
    await generatePostsData(dataDir);
    
    console.log('✅ 모든 정적 데이터 생성 완료!');
    
  } catch (error) {
    console.error('❌ 정적 데이터 생성 중 오류 발생:', error);
    process.exit(1);
  }
}

async function generateCategoriesData(dataDir) {
  try {
    console.log('📁 카테고리 데이터 생성 중...');
    
    // 1레벨 카테고리와 자식 카테고리들을 모두 가져오기
    const response = await axios.get(`${API_BASE_URL}/api/categories`, {
      params: {
        filters: {
          level: {
            $eq: 1
          }
        },
        fields: ['name', 'slug'],
        populate: {
          categories: {
            fields: ['name', 'slug'],
            populate: {
              posts: {
                fields: ['id'] 
              }
            }
          },
          posts: {
            fields: ['id']
          }
        }
      }
    });

    const categories = response.data.data || [];
    
    // 카테고리 데이터 정리
    const cleanedCategories = categories.map((category) => {
      const childCategories = category.categories || [];
      
      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        level: 1,
        categories: childCategories.map((child) => ({
          id: child.id,
          name: child.name,
          slug: child.slug,
          level: 2,
          posts: child.posts || []
        })),
        posts: category.posts || []
      };
    });

    // categories.json 파일 생성
    const categoriesPath = path.join(dataDir, 'categories.json');
    fs.writeFileSync(categoriesPath, JSON.stringify(cleanedCategories, null, 2));
    
    console.log(`✅ 카테고리 데이터 저장: ${categoriesPath}`);
    console.log(`📊 카테고리 수: ${cleanedCategories.length}개 (1레벨) + ${cleanedCategories.reduce((acc, cat) => acc + (cat.categories?.length || 0), 0)}개 (2레벨)`);
    
  } catch (error) {
    console.error('❌ 카테고리 데이터 생성 실패:', error.message);
    throw error;
  }
}

async function generatePostsData(dataDir) {
  try {
    console.log('📄 포스트 데이터 생성 중...');
    
    // 모든 포스트 가져오기 (페이지네이션으로 모두 가져옴)
    let allPosts = [];
    let page = 1;
    const pageSize = 25;
    
    while (true) {
      const response = await axios.get(`${API_BASE_URL}/api/posts`, {
        params: {
          sort: 'publishedAt:desc',
          pagination: {
            page: page,
            pageSize: pageSize
          },
          fields: ['title', 'slug', 'publishedAt', 'description'],
          populate: {
            cover: {
              fields: ['url']
            },
            tags: {
              fields: ['name', 'slug']
            },
            category: {
              fields: ['name', 'slug']
            }
          }
        }
      });
      
      const posts = response.data.data || [];
      if (posts.length === 0) break;
      
      // 포스트 데이터 정리
      const cleanedPosts = posts.map(post => {
        // 이미지 URL을 절대 경로로 변환
        let coverUrl = null;
        if (post.cover?.url) {
          const url = post.cover.url;
          // 상대 경로인지 확인 (/, http:// 또는 https://로 시작하지 않는 경우)
          if (url.startsWith('/')) {
            coverUrl = `${API_BASE_URL}${url}`;
          } else if (url.startsWith('http://') || url.startsWith('https://')) {
            coverUrl = url;
          } else {
            coverUrl = `${API_BASE_URL}/${url}`;
          }
        }

        return {
          id: post.id,
          title: post.title,
          slug: post.slug,
          description: post.description,
          publishedAt: post.publishedAt,
          cover: coverUrl ? {
            url: coverUrl
          } : null,
          tags: (post.tags || []).map(tag => ({
            name: tag.name,
            slug: tag.slug
          })),
          category: post.category ? {
            name: post.category.name,
            slug: post.category.slug
          } : null
        };
      });
      
      allPosts = allPosts.concat(cleanedPosts);
      
      console.log(`   페이지 ${page}: ${posts.length}개 포스트 수집`);
      
      if (posts.length < pageSize) break;
      page++;
    }

    // posts.json 파일 생성
    const postsPath = path.join(dataDir, 'posts.json');
    fs.writeFileSync(postsPath, JSON.stringify(allPosts, null, 2));
    
    console.log(`✅ 포스트 데이터 저장: ${postsPath}`);
    console.log(`📊 총 포스트 수: ${allPosts.length}개`);
    
  } catch (error) {
    console.error('❌ 포스트 데이터 생성 실패:', error.message);
    throw error;
  }
}

generateStaticData(); 