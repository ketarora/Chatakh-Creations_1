import { useEffect, useState } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";

const mainCollections = [
  {
    value: "threads-of-aura",
    name: "The Threads of Aura",
    image:
      "/threads of aura.png",
  },
  {
    value: "colors-of-aura",
    name: "The Colors of Aura",
    image:
      "/colors of aura.png",
  },
];

const Collections = () => {
  const { mainCollection } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || "";
  const isNavratriPage = location.pathname === "/navratri";
  const hasSelectedCollection = Boolean(mainCollection) || isNavratriPage;

  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(
    ["men", "women", "couple"].includes(categoryParam) ? categoryParam : "men"
  );
  const [loading, setLoading] = useState(false);

  const selectedCollection = isNavratriPage
    ? { value: "navratri", name: "Navratri Edit" }
    : mainCollections.find((collection) => collection.value === mainCollection);

  useEffect(() => {
    if (!hasSelectedCollection || (!selectedCollection && !isNavratriPage)) {
      setProducts([]);
      return;
    }

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const url = isNavratriPage
          ? `/api/products?isNavratri=true&category=${category}`
          : `/api/products?mainCollection=${selectedCollection.value}&category=${category}`;

        const res = await api.get(url);
        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("COLLECTION FETCH ERROR:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [hasSelectedCollection, selectedCollection, category, isNavratriPage]);

  const categoryOptions = [
    { value: "men", label: "Man" },
    { value: "women", label: "Woman" },
    { value: "couple", label: "Couple" },
  ];

  return (
    <div className="min-h-screen bg-[#fff6e9] w-full">
      {/* HEADER */}
      <div className="bg-linear-to-br from-[#ec0080] to-[#c7006b] text-[#fff6e9] py-8 sm:py-12 md:py-16 px-3 sm:px-4 md:px-6 w-full">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3">
            {selectedCollection ? selectedCollection.name : "Collections"}
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-[#fff6e9]/90 max-w-2xl mx-auto">
            Crafted for those who wear confidence, premium silhouettes that turn everyday moments into statements.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-8 sm:py-10 md:py-12 w-full">
        {hasSelectedCollection && selectedCollection && (
          <div className="mb-6">
            <Link
              to="/collections"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-[#fff6e9] text-[#5a3b38] border border-[#f4c87f] hover:border-[#00aeb2] hover:text-[#007d80] transition-colors duration-300"
            >
              <span aria-hidden="true">←</span>
              Back to Collections
            </Link>
          </div>
        )}

        {!hasSelectedCollection && (
          <div className="mb-8 sm:mb-10 md:mb-12 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {mainCollections.map((collection) => (
              <Link
                key={collection.value}
                to={`/collections/${collection.value}`}
                className="relative h-56 sm:h-64 md:h-72 rounded-2xl overflow-hidden border-2 border-[#f3c178] hover:border-[#00aeb2] hover:shadow-xl hover:shadow-[#00aeb2]/20 transition-all duration-300 block"
              >
                <img
                  src={collection.image}
                  alt={collection.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                  <p className="text-[#fff6e9] text-xl sm:text-2xl font-bold tracking-wide">{collection.name}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {hasSelectedCollection && !selectedCollection && (
          <div className="text-center py-16 sm:py-20 border border-[#f3c178] rounded-2xl bg-[#fffdf8]">
            <p className="text-lg sm:text-xl text-[#5a3b38] font-semibold">Collection not found</p>
            <Link
              to="/collections"
              className="inline-block mt-4 px-4 py-2 rounded-full text-sm font-semibold bg-[#ec0080] text-[#fff6e9] border border-[#ec0080] hover:bg-[#c7006b] transition-colors duration-300"
            >
              Back to Collections
            </Link>
          </div>
        )}

        {/* GENDER FILTER BUTTONS */}
        {hasSelectedCollection && selectedCollection && (
          <div className="mb-8 sm:mb-10 md:mb-12 flex gap-2 sm:gap-3 justify-center flex-wrap">
            {categoryOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setCategory(option.value)}
                className={`px-3 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 ${
                  category === option.value
                    ? "bg-[#00aeb2] text-[#fff6e9] shadow-lg shadow-[#00aeb2]/40"
                    : "bg-[#fffdf8] text-[#7a5e4f] border border-[#f3c178] hover:border-[#00aeb2] hover:text-[#007d80] hover:shadow-md"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {/* PRODUCTS GRID */}
        {!hasSelectedCollection ? null : !selectedCollection ? null : loading ? (
          <div className="flex justify-center items-center py-16 sm:py-20">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-[#ec0080]"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <p className="text-lg sm:text-xl text-[#5a3b38] font-semibold">
              No products available in this section
            </p>
            <p className="text-[#8a6b57] mt-2 text-sm sm:text-base">Check back soon for new arrivals!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Collections;
