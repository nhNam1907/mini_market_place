import type { PublicProductSortBy, PublicProductSortOrder } from "@market-place/shared/api";
import { ArrowLeftOutlined, ShopOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Card, Col, Empty, Input, Pagination, Row, Select, Skeleton, Space, Tag, Typography } from "antd";
import { Link, useParams } from "react-router-dom";

import { useProductListSearchParams } from "@/hooks/useProductListSearchParams";
import { useCategoriesQuery, usePublicShopDetailQuery, usePublicShopProductsQuery } from "@/hooks/useSystem";

const sortByOptions = [
  { label: "Newest", value: "createdAt" },
  { label: "Price", value: "price" },
  { label: "Name", value: "name" },
] satisfies Array<{ label: string; value: PublicProductSortBy }>;

const sortOrderOptions = [
  { label: "Descending", value: "desc" },
  { label: "Ascending", value: "asc" },
] satisfies Array<{ label: string; value: PublicProductSortOrder }>;

function PublicShopPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const { params, searchInput, setSearchInput, setCategory, submitSearch, setSortBy, setSortOrder, setPage } =
    useProductListSearchParams();

  const { data: shopResponse, isLoading: isShopLoading, isError: isShopError } = usePublicShopDetailQuery(shopId);
  const { data: categoriesResponse, isLoading: isCategoriesLoading } = useCategoriesQuery();
  const { data: productsResponse, isLoading: isProductsLoading, isFetching: isProductsFetching } = usePublicShopProductsQuery(
    shopId,
    params,
  );

  const shop = shopResponse?.data;
  const categories = categoriesResponse?.data ?? [];
  const products = productsResponse?.data.products ?? [];
  const meta = productsResponse?.data.meta;
  const categoryChips = [{ id: "all", name: "All" }, ...categories];

  if (isShopLoading) {
    return (
      <Card bordered={false} className="catalog-empty-card">
        <Skeleton active paragraph={{ rows: 10 }} />
      </Card>
    );
  }

  if (isShopError || !shop) {
    return (
      <Card bordered={false} className="catalog-empty-card">
        <Empty image={<ShopOutlined style={{ fontSize: 48 }} />} description="Shop not found or could not be loaded.">
          <Button type="primary">
            <Link to="/catalog">Back to catalog</Link>
          </Button>
        </Empty>
      </Card>
    );
  }

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <Breadcrumb
        items={[
          { title: <Link to="/">Home</Link> },
          { title: <Link to="/catalog">Catalog</Link> },
          { title: shop.name },
        ]}
      />

      <Button icon={<ArrowLeftOutlined />} type="link">
        <Link to="/catalog">Back to catalog</Link>
      </Button>

      <section className="catalog-hero">
        <Space direction="vertical" size={12}>
          <Tag color="gold">Public Shop</Tag>
          <Typography.Title style={{ margin: 0 }}>{shop.name}</Typography.Title>
          <Typography.Text className="catalog-hero-text">
            {shop.description ?? "This shop has not added a public description yet."}
          </Typography.Text>
          <Typography.Text type="secondary">Managed by {shop.owner.name}</Typography.Text>
        </Space>
      </section>

      <Card bordered={false} className="catalog-filter-card">
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <div>
            <Typography.Title level={4} style={{ marginBottom: 4 }}>
              Browse this shop
            </Typography.Title>
            <Typography.Text type="secondary">
              Search, filter, and sort only within {shop.name}.
            </Typography.Text>
          </div>

          <div className="catalog-control-grid">
            <Input.Search
              allowClear
              enterButton="Search"
              onChange={(event) => setSearchInput(event.target.value)}
              onSearch={submitSearch}
              placeholder="Search products in this shop"
              value={searchInput}
            />
            <Select onChange={setSortBy} options={sortByOptions} value={params.sortBy} />
            <Select onChange={setSortOrder} options={sortOrderOptions} value={params.sortOrder} />
          </div>

          <Space size={[8, 8]} wrap>
            {categoryChips.map((category) => {
              const isActive = category.id === "all" ? !params.categoryId : params.categoryId === category.id;

              return (
                <Button
                  key={category.id}
                  loading={isCategoriesLoading}
                  onClick={() => setCategory(category.id === "all" ? undefined : category.id)}
                  type={isActive ? "primary" : "default"}
                >
                  {category.name}
                </Button>
              );
            })}
          </Space>
        </Space>
      </Card>

      <div className="catalog-toolbar">
        <div>
          <Typography.Title level={4} style={{ marginBottom: 4 }}>
            Products from {shop.name}
          </Typography.Title>
          <Typography.Text type="secondary">
            {meta ? `${meta.totalItems} products found` : "Loading products"}
            {params.search ? ` for "${params.search}"` : ""}
          </Typography.Text>
        </div>
        <Tag color={isProductsFetching ? "processing" : "default"}>
          {isProductsFetching ? "Updating" : `Page ${meta?.currentPage ?? params.pageNumber}`}
        </Tag>
      </div>

      {isProductsLoading ? (
        <Row gutter={[16, 16]}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Col key={index} lg={6} md={8} sm={12} xs={24}>
              <Card className="catalog-product-card">
                <Skeleton active paragraph={{ rows: 4 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : products.length === 0 ? (
        <Card bordered={false} className="catalog-empty-card">
          <Empty description="This shop does not have products matching the current filters." />
        </Card>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {products.map((item) => (
              <Col key={item.id} lg={6} md={8} sm={12} xs={24}>
                <Link to={`/products/${item.id}`}>
                  <Card
                    bordered={false}
                    className="catalog-product-card"
                    hoverable
                    cover={
                      item.imageUrl ? (
                        <img alt={item.name} className="catalog-product-image" src={item.imageUrl} />
                      ) : (
                        <div className="catalog-product-placeholder">
                          <Typography.Text strong>{item.category.name}</Typography.Text>
                        </div>
                      )
                    }
                  >
                    <Space direction="vertical" size={10} style={{ width: "100%" }}>
                      <Space size={[8, 8]} wrap>
                        <Tag color="geekblue">{item.category.name}</Tag>
                        <Tag>{item.shop.name}</Tag>
                      </Space>
                      <Typography.Title ellipsis={{ rows: 2 }} level={5} style={{ margin: 0 }}>
                        {item.name}
                      </Typography.Title>
                      <Typography.Paragraph ellipsis={{ rows: 2 }} type="secondary" style={{ marginBottom: 0 }}>
                        {item.description ?? "Product description will appear here."}
                      </Typography.Paragraph>
                      <div className="catalog-product-footer">
                        <Typography.Title level={4} style={{ margin: 0 }}>
                          {item.price.toLocaleString("vi-VN")} VND
                        </Typography.Title>
                        <Typography.Text type="secondary">Stock: {item.stock}</Typography.Text>
                      </div>
                    </Space>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>

          <div className="catalog-pagination-wrap">
            <Pagination
              current={meta?.currentPage ?? params.pageNumber}
              onChange={setPage}
              pageSize={meta?.pageSize ?? params.pageSize}
              showSizeChanger={false}
              total={meta?.totalItems ?? 0}
            />
          </div>
        </>
      )}
    </Space>
  );
}

export default PublicShopPage;
