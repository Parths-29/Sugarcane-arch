import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, FileQuestion, ArrowRight, Calendar } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { MOCK_ARTICLES } from "@/lib/mockData";
import { Button } from "@/components/ui/Button";

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const ITEMS_PER_PAGE = 4;

export default function News() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [articles, setArticles] = useState(MOCK_ARTICLES);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    async function fetchNews() {
      setIsLoadingNews(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/news`);
        if (res.ok) {
          const data = await res.json();
          // Merge AI text with mock thumbnails
          const newArticles = data.articles.map((aiArticle: any, index: number) => {
            const mockIndex = index % MOCK_ARTICLES.length;
            return {
              ...aiArticle,
              thumbnail: MOCK_ARTICLES[mockIndex].thumbnail
            };
          });
          setArticles(newArticles);
        }
      } catch (err) {
        console.error('Error fetching AI news:', err);
      } finally {
        setIsLoadingNews(false);
      }
    }
    fetchNews();
  }, []);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/news`);
      if (res.ok) {
        const data = await res.json();
        const newArticles = data.articles.map((aiArticle: any, index: number) => {
          const mockIndex = (articles.length + index) % MOCK_ARTICLES.length;
          return {
            ...aiArticle,
            id: aiArticle.id + '-' + Date.now() + index, // Ensure unique ID
            thumbnail: MOCK_ARTICLES[mockIndex].thumbnail
          };
        });
        setArticles(prev => [...prev, ...newArticles]);
        setVisibleCount(prev => prev + newArticles.length);
      }
    } catch (err) {
      console.error('Error fetching more AI news:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleGenerateSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoadingNews(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/news?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        const newArticles = data.articles.map((aiArticle: any, index: number) => {
          const mockIndex = (articles.length + index) % MOCK_ARTICLES.length;
          return {
            ...aiArticle,
            id: aiArticle.id + '-' + Date.now() + index,
            thumbnail: MOCK_ARTICLES[mockIndex].thumbnail
          };
        });
        setArticles(prev => [...newArticles, ...prev]);
        setVisibleCount(prev => prev + newArticles.length);
      }
    } catch (err) {
      console.error('Error generating specific news:', err);
    } finally {
      setIsLoadingNews(false);
    }
  };

  // Filter articles by keyword
  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return articles;
    const q = searchQuery.toLowerCase();
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.author.toLowerCase().includes(q)
    );
  }, [searchQuery, articles]);

  const displayedArticles = filteredArticles.slice(0, visibleCount);
  const hasMore = !searchQuery.trim(); // Always show load more if not searching

  return (
    <div className="page-container bg-neutral-50 dark:bg-neutral-950 min-h-screen transition-colors duration-300">
      <Navbar />

      <main className="flex-1 content-wrapper py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-green-900 dark:text-green-400 font-[Outfit]">
            {t("newsTitle")}
          </h1>

          {/* Search bar */}
          <div className="relative mt-4 max-w-lg">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              id="news-search"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(ITEMS_PER_PAGE); // Reset pagination on search
              }}
              placeholder={t("newsSearch")}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm text-base text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-500 transition-all placeholder:text-neutral-400"
            />
          </div>
        </motion.div>

        {isLoadingNews && (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            <span className="ml-3 text-neutral-500">Generating live news...</span>
          </div>
        )}

        {/* Articles Grid */}
        {!isLoadingNews && filteredArticles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mb-4">
              <FileQuestion size={32} className="text-neutral-400" />
            </div>
            <p className="text-lg font-semibold text-neutral-600 dark:text-neutral-300">
              No existing articles found for "{searchQuery}"
            </p>
            <p className="text-sm text-neutral-400 mt-2 mb-6">
              Would you like the AI to generate live news about this topic?
            </p>
            <Button onClick={handleGenerateSearch} disabled={isLoadingNews}>
              {isLoadingNews ? "Generating..." : `Generate News for "${searchQuery}"`}
            </Button>
          </motion.div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 gap-4 mt-6 stagger-children">
              {displayedArticles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                >
                  <Link
                    to={`/article/${article.id}`}
                    state={{ article }}
                    className="group block bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={article.thumbnail}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-2">
                        <Calendar size={12} />
                        <span>{new Date(article.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                      <h3 className="font-bold text-neutral-900 dark:text-white text-base leading-snug line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
                        {article.body || article.excerpt}
                      </p>
                      <div className="flex items-center gap-1 text-green-600 text-sm font-semibold mt-4 group-hover:gap-2 transition-all">
                        <span>{t("readMore")}</span>
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button
                  id="load-more"
                  variant="secondary"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? "Generating..." : t("loadMore")}
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
