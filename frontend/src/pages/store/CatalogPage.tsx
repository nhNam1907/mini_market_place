import type { PublicProductSortBy, PublicProductSortOrder } from "@market-place/shared/api";
import { Button, Card, Col, Empty, Input, Pagination, Row, Select, Skeleton, Space, Tag, Typography } from "antd";
import { Link } from "react-router-dom";

import { useProductListSearchParams } from "@/hooks/useProductListSearchParams";
import { useCategoriesQuery, usePublicProductsQuery } from "@/hooks/useSystem";

const sortByOptions = [
  { label: "Newest", value: "createdAt" },
  { label: "Price", value: "price" },
  { label: "Name", value: "name" },
] satisfies Array<{ label: string; value: PublicProductSortBy }>;

const sortOrderOptions = [
  { label: "Descending", value: "desc" },
  { label: "Ascending", value: "asc" },
] satisfies Array<{ label: string; value: PublicProductSortOrder }>;

function CatalogPage() {
  const { params, searchInput, setSearchInput, setCategory, submitSearch, setSortBy, setSortOrder, setPage } =
    useProductListSearchParams();
  const { data: categoriesResponse, isLoading: isCategoriesLoading } = useCategoriesQuery();
  const { data, isLoading, isFetching } = usePublicProductsQuery(params);

  const categories = categoriesResponse?.data ?? [];
  const products = data?.data.products ?? [];
  const meta = data?.data.meta;
  const categoryChips = [{ id: "all", name: "All" }, ...categories];

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <section className="catalog-hero">
        <Space direction="vertical" size={12}>
          <Tag color="blue">Marketplace Catalog</Tag>
          <Typography.Title style={{ margin: 0 }}>
            Browse products across every shop in one feed.
          </Typography.Title>
          <Typography.Text className="catalog-hero-text">
            Search, filter, and sort products from the public marketplace catalog API.
          </Typography.Text>
        </Space>
      </section>

      <Card bordered={false} className="catalog-filter-card">
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <div>
            <Typography.Title level={4} style={{ marginBottom: 4 }}>
              Find products faster
            </Typography.Title>
            <Typography.Text type="secondary">
              Combine search, category, and sort controls to shape the catalog feed.
            </Typography.Text>
          </div>

          <div className="catalog-control-grid">
            <Input.Search
              allowClear
              enterButton="Search"
              onChange={(event) => setSearchInput(event.target.value)}
              onSearch={submitSearch}
              placeholder="Search by product name or description"
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
            {params.categoryId ? "Filtered products" : "All products"}
          </Typography.Title>
          <Typography.Text type="secondary">
            {meta ? `${meta.totalItems} products found` : "Loading products"}
            {params.search ? ` for "${params.search}"` : ""}
          </Typography.Text>
        </div>
        <Tag color={isFetching ? "processing" : "default"}>
          {isFetching ? "Updating" : `Page ${meta?.currentPage ?? params.pageNumber}`}
        </Tag>
      </div>

      {isLoading ? (
        <Row gutter={[16, 16]}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Col key={index} lg={6} md={8} sm={12} xs={24}>
              <Card className="catalog-product-card">
                <Skeleton active paragraph={{ rows: 4 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : products.length === 0 ? (
        <Card bordered={false} className="catalog-empty-card">
          <Empty description="No products match the current search or category." />
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

export default CatalogPage;
