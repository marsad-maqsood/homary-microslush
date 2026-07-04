"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Navigator from "../../components/Navigator";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import Image from "next/image";
import { useCart } from "../../context/CartContext";
import { bigDataProductService } from "../../services/bigDataProductService";
import { Product } from "../../types/product";

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const [product, setProduct] = useState<Product | null>(null);
	const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [quantity, setQuantity] = useState(1);
	const { addToCart } = useCart();

	useEffect(() => {
		let isMounted = true;
		async function loadProduct() {
			setLoading(true);
			try {
				const prod = await bigDataProductService.getProductById(id);
				if (prod && isMounted) {
					setProduct(prod);
					
					// Load similar products in the same category
					const similarResult = await bigDataProductService.getProductsByCategory(prod.category, { page: 1, limit: 5 });
					if (isMounted) {
						const filtered = similarResult.products
							.filter(p => p.id !== prod.id)
							.slice(0, 4);
						setSimilarProducts(filtered);
					}
				}
			} catch (err) {
				// eslint-disable-next-line no-console
				console.error("Failed to load product details", err);
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		}
		loadProduct();
		return () => {
			isMounted = false;
		};
	}, [id]);

	const increaseQuantity = () => {
		setQuantity(quantity + 1);
	};

	const decreaseQuantity = () => {
		if (quantity > 1) {
			setQuantity(quantity - 1);
		}
	};

	const handleAddToCart = () => {
		if (product) {
			addToCart({
				id: product.id,
				name: product.name,
				price: product.price,
				image: product.image,
				brand: product.brand,
				category: product.category,
			}, quantity);
		}
	};

	if (loading) {
		return (
			<div className="font-montserrat bg-white min-h-screen">
				<Navigator activePage="shop" />
				<main className="flex items-center justify-center pt-32 pb-20">
					<div className="text-center">
						<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
						<p className="mt-4 text-gray-600">Loading product details...</p>
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	if (!product) {
		return (
			<div className="font-montserrat bg-white min-h-screen">
				<Navigator activePage="shop" />
				<main className="flex flex-col items-center justify-center pt-32 pb-20 px-4">
					<h2 className="text-2xl font-bold text-textdark mb-4">Product Not Found</h2>
					<p className="text-gray-600 mb-6">The product you are looking for does not exist or has been removed.</p>
					<Link href="/shop" className="bg-[#054C73] text-[#ffffff] px-6 py-2 rounded font-bold">
						Back to Shop
					</Link>
				</main>
				<Footer />
			</div>
		);
	}

	// Format price display
	const displayPrice = new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
	}).format(product.price);

	return (
		<div className="font-montserrat bg-white">
			<Navigator activePage="shop" />

			<main>
				{/* Hero Section */}
				<div className="flex flex-col py-16 px-4 sm:px-6 md:px-12 lg:px-16 xl:px-[60px] pt-20">
					{/* Product Preview Section */}
					<div className="flex flex-col md:flex-row items-center justify-center gap-8 lg:gap-[70px]">
						{/* Product Image */}
						<div className="flex items-center justify-center w-full md:w-1/2 px-4 sm:px-8 md:px-12 lg:px-16 xl:px-28">
							<div className="relative w-full max-w-[400px] md:max-w-[500px] lg:max-w-[600px] xl:max-w-[730px] aspect-square bg-gray-50 rounded-lg overflow-hidden p-8 flex items-center justify-center">
								<Image
									src={product.image}
									alt={product.name}
									className="object-contain w-full h-full max-h-[500px]"
									width={1000}
									height={1000}
									priority
								/>
							</div>
						</div>

						{/* Product Info */}
						<div className="w-full md:w-1/2 px-4 py-4 sm:px-6">
							<p className="font-bold text-textdark text-2xl sm:text-[28px] md:text-[32px] mb-[10px]">
								{product.name}
							</p>
							<div className="flex items-center gap-1 text-[#FFC800] pb-[10px]" aria-label={`Rating: ${product.rating} out of 5 stars`}>
								{[...Array(5)].map((_, i) => (
									<svg
										key={i}
										className={`w-4 h-4 ${
											i < product.rating ? "text-yellow-400" : "text-gray-300"
										}`}
										fill="currentColor"
										viewBox="0 0 20 20"
										aria-hidden="true"
									>
										<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
									</svg>
								))}
								<span className="text-[#979797] ml-2">({product.reviewCount} reviews)</span>
							</div>
							<p className="text-primary font-bold text-xl sm:text-2xl">
								{displayPrice}
							</p>
							<div className="mt-4 sm:mt-[30px]">
								<p className="font-bold text-textdark text-lg sm:text-[20px] mb-[10px]">
									Description
								</p>
								<p className="font-medium text-[#979797] text-[14px] sm:text-[15px] leading-[25px] sm:leading-[30px] mb-[10px]">
									{product.description}
								</p>
							</div>
						</div>
					</div>

					{/* Additional Images & Add to Cart Section */}
					<div className="flex flex-col lg:flex-row justify-between mt-8 md:mt-[50px] gap-6 lg:gap-[80px]">
						{/* Additional Images */}
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 md:gap-[60px] items-center">
							{[1, 2, 3, 4].map((num) => (
								<div key={num} className="additional-img bg-gray-50 border border-gray-100 rounded p-2 flex items-center justify-center aspect-square">
									<Image
										src={product.image}
										alt=""
										className="w-full h-full object-contain opacity-60 hover:opacity-100 transition-opacity"
										width={100}
										height={100}
									/>
								</div>
							))}
						</div>

						{/* Add to Cart Section */}
						<div className="flex flex-col items-stretch w-full lg:w-[690px]">
							<div className="flex items-center justify-between gap-4 sm:gap-[20px]">
								<div className="inline-flex items-center border border-[#979797]">
									<button
										onClick={decreaseQuantity}
										className="w-[40px] sm:w-[60px] h-6 flex items-center justify-center bg-transparent text-[#054C73] border-none cursor-pointer"
									>
										-
									</button>
									<span className="min-w-[40px] sm:min-w-[60px] min-h-6 flex items-center justify-center px-2 border-l border-r border-[#979797]">
										{quantity}
									</span>
									<button
										onClick={increaseQuantity}
										className="w-[40px] sm:w-[60px] h-6 flex items-center justify-center bg-transparent text-[#054C73] border-none cursor-pointer"
									>
										+
									</button>
								</div>

								<div className="w-full">
									<Link href="/shop/cart" className="w-full block">
										<button
											type="button"
											onClick={handleAddToCart}
											className="add-to-cart-btn w-full block p-3 bg-[#054C73] text-[#ffffff] font-bold border-none rounded-[8px] text-base sm:text-lg text-center cursor-pointer"
										>
											Add to Cart
										</button>
									</Link>
								</div>
							</div>

							<div className="w-full mt-[15px]">
								<button className="w-full block p-3 bg-[#ffffff] text-[#054C73] font-bold text-base sm:text-lg border border-[#054C73] rounded-[7px] text-center cursor-pointer">
									Add to Wishlist
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* Product Details Section */}
				<div className="px-4 sm:px-8 md:px-12 lg:px-[60px] py-[30px]">
					<p className="font-bold text-xl sm:text-2xl md:text-[24px] text-textdark mb-[20px]">
						Product Details
					</p>

					<div className="border border-textdark rounded-[10px] px-4 sm:px-6 md:px-[50px] py-[5px]">
						<p className="font-medium text-[14px] sm:text-[15px] text-[#979797] mt-[10px] mb-0">
							Premium quality {product.subcategory} designed for modern homes. {product.description}
						</p>

						<p className="mt-[15px] font-bold text-lg sm:text-[20px] text-textdark">
							Specifications
						</p>

						<div className="w-full mx-auto">
							<div className="flex flex-col sm:flex-row justify-between items-start py-[10px] border-b border-textdark">
								<div className="text-start mb-3 sm:mb-0">
									<div className="text-[#979797] text-[14px] sm:text-[15px] font-medium">
										Color
									</div>
									<div className="text-textdark text-[14px] sm:text-[15px] font-bold capitalize">
										{product.colors.join(", ")}
									</div>
								</div>

								<div className="text-start w-full sm:w-1/2">
									<div className="text-[#979797] text-[14px] sm:text-[15px] font-medium">
										Material
									</div>
									<div className="text-textdark text-[14px] sm:text-[15px] font-bold capitalize">
										{product.material.join(", ")}
									</div>
								</div>
							</div>

							<div className="flex flex-col sm:flex-row justify-between items-start py-[10px] border-b border-textdark">
								<div className="text-start mb-3 sm:mb-0">
									<div className="text-[#979797] text-[14px] sm:text-[15px] font-medium">
										Brand
									</div>
									<div className="text-textdark text-[14px] sm:text-[15px] font-bold">
										{product.brand}
									</div>
								</div>

								<div className="text-start w-full sm:w-1/2">
									<div className="text-[#979797] text-[14px] sm:text-[15px] font-medium">
										Dimensions (W x H x D)
									</div>
									<div className="text-textdark text-[14px] sm:text-[15px] font-bold">
										{product.dimensions.width} x {product.dimensions.height} x {product.dimensions.depth} cm
									</div>
								</div>
							</div>

							<div className="flex flex-col sm:flex-row justify-between items-start py-[10px]">
								<div className="text-start mb-3 sm:mb-0">
									<div className="text-[#979797] text-[14px] sm:text-[15px] font-medium">
										Weight
									</div>
									<div className="text-textdark text-[14px] sm:text-[15px] font-bold">
										{product.weight} kg
									</div>
								</div>

								<div className="text-start w-full sm:w-1/2">
									<div className="text-[#979797] text-[14px] sm:text-[15px] font-medium">
										Availability
									</div>
									<div className="text-textdark text-[14px] sm:text-[15px] font-bold">
										{product.inStock ? `${product.stockQuantity} units available` : "Out of Stock"}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Customer Reviews Section */}
				<div className="py-[30px] px-4 sm:px-8 md:px-12 lg:px-[60px]">
					<p className="font-bold text-xl sm:text-2xl md:text-[24px] text-textdark">
						Customer Reviews ({product.reviewCount})
					</p>

					<div className="mt-[20px]">
						{/* Review 1 */}
						<div className="flex flex-col sm:flex-row justify-start items-start sm:items-center gap-4 sm:gap-[40px]">
							<div className="bg-[#054C73] text-[#ffffff] flex justify-center items-center w-[78px] py-[10px] px-[20px] gap-[2px]">
								<p className="font-bold text-[25px]">5</p>
								<span className="fa fa-star text-[23px]"></span>
							</div>
							<div className="py-[10px] w-full">
								<p className="text-[#979797] text-[14px] sm:text-[15px] font-medium leading-[25px]">
									Absolutely love this {product.name}! The {product.material[0]} feel is premium, and it fits perfectly in my space. Very easy to assemble.
								</p>
								<div className="flex gap-[20px] pb-[10px] border-b border-black text-[#979797] text-[14px] sm:text-[15px] font-medium leading-[25px]">
									<p>John Doe</p>
									<p>11 Oct 2025</p>
								</div>
							</div>
						</div>

						{/* Review 2 */}
						{product.reviewCount > 1 && (
							<div className="flex flex-col sm:flex-row justify-start items-start sm:items-center gap-4 sm:gap-[40px] mt-[20px]">
								<div className="bg-[#054C73] text-[#ffffff] flex justify-center items-center w-[78px] py-[10px] px-[20px] gap-[2px]">
									<p className="font-bold text-[25px]">4</p>
									<span className="fa fa-star text-[23px]"></span>
								</div>
								<div className="py-[10px] w-full">
									<p className="text-[#979797] text-[14px] sm:text-[15px] font-medium leading-[25px]">
										Great product quality for the price. The packaging was neat, and it was delivered on time. The color matches the catalog nicely.
									</p>
									<div className="flex gap-[20px] pb-[10px] border-b border-black text-[#979797] text-[14px] sm:text-[15px] font-medium leading-[25px]">
										<p>Jane Smith</p>
										<p>14 Nov 2025</p>
									</div>
								</div>
							</div>
						)}
					</div>
					<p className="font-medium text-lg sm:text-[20px] text-[#111111] mt-[20px] cursor-pointer">
						View All {product.reviewCount} reviews
					</p>
				</div>

				{/* Similar Product Section */}
				{similarProducts.length > 0 && (
					<div className="py-[30px] sm:py-[50px] px-6 sm:px-8 md:px-12 lg:px-[60px]">
						<p className="text-xl sm:text-2xl md:text-[24px] font-bold text-textdark mb-[20px]">
							Similar Products
						</p>

						<div className="mb-[30px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-4 md:gap-[30px]">
							{similarProducts.map((simProd) => (
								<ProductCard
									key={simProd.id}
									id={simProd.id}
									name={simProd.name}
									image={simProd.image}
									price={simProd.price}
									reviewCount={simProd.reviewCount}
									rating={simProd.rating}
									category={simProd.category}
									brand={simProd.brand}
								/>
							))}
						</div>
					</div>
				)}
			</main>

			<Footer />
		</div>
	);
}
