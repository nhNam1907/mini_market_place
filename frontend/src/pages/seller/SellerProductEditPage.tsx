import type { UpdateSellerProductRequest } from "@market-place/shared/api";
import type { UploadFile } from "antd";
import { ArrowLeftOutlined, PlusOutlined } from "@ant-design/icons";
import {
  App,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Image,
  Input,
  InputNumber,
  Row,
  Select,
  Skeleton,
  Space,
  Typography,
  Upload,
} from "antd";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import {
  useReplaceSellerProductImagesMutation,
  useSellerProductQuery,
  useUpdateSellerProductMutation,
} from "@/hooks/useSellerProducts";
import { useCategoriesQuery } from "@/hooks/useSystem";

type ReplaceImagesFormValues = {
  images?: UploadFile[];
};

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_PRODUCT_IMAGES = 5;

function getFilePreview(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function normalizeUploadFileList(event: { fileList?: UploadFile[] } | UploadFile[]) {
  if (Array.isArray(event)) {
    return event;
  }

  return event.fileList ?? [];
}

function buildReplaceImagesFormData(values: ReplaceImagesFormValues) {
  const formData = new FormData();

  values.images?.forEach((file) => {
    if (file.originFileObj) {
      formData.append("images", file.originFileObj);
    }
  });

  return formData;
}

function SellerProductEditPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { productId } = useParams();
  const { data, isLoading } = useSellerProductQuery(productId);
  const { data: categoryResponse, isLoading: isCategoriesLoading } = useCategoriesQuery();
  const updateMutation = useUpdateSellerProductMutation(productId ?? "");
  const replaceImagesMutation = useReplaceSellerProductImagesMutation(productId ?? "");
  const [form] = Form.useForm<UpdateSellerProductRequest>();
  const [imageForm] = Form.useForm<ReplaceImagesFormValues>();
  const [previewImage, setPreviewImage] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const product = data?.data;

  const categoryOptions = useMemo(
    () =>
      (categoryResponse?.data ?? []).map((category) => ({
        label: category.name,
        value: category.id,
      })),
    [categoryResponse?.data],
  );

  useEffect(() => {
    if (!product) {
      return;
    }

    form.setFieldsValue({
      name: product.name,
      description: product.description ?? "",
      price: product.price,
      stock: product.stock,
      categoryId: product.category.id,
    });
  }, [form, product]);

  const handleUpdateProduct = async (values: UpdateSellerProductRequest) => {
    if (!productId) {
      return;
    }

    try {
      const response = await updateMutation.mutateAsync(values);
      await message.success(response.message);
      navigate(`/seller/products/${productId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update product";
      void message.error(errorMessage);
    }
  };

  const handleBeforeUpload = (file: { type: string; size: number }) => {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      void message.error("Only JPEG, PNG, and WEBP images are allowed");
      return Upload.LIST_IGNORE;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      void message.error("Each image must be 5MB or smaller");
      return Upload.LIST_IGNORE;
    }

    return false;
  };

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview && file.originFileObj) {
      file.preview = await getFilePreview(file.originFileObj);
    }

    setPreviewImage(file.url ?? file.preview ?? "");
    setIsPreviewOpen(true);
  };

  const handleReplaceImages = async (values: ReplaceImagesFormValues) => {
    if (!productId) {
      return;
    }

    try {
      const response = await replaceImagesMutation.mutateAsync(buildReplaceImagesFormData(values));
      await message.success(response.message);
      imageForm.resetFields();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to replace product images";
      void message.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <Card bordered={false}>
        <Skeleton active />
      </Card>
    );
  }

  if (!product) {
    return (
      <Card bordered={false}>
        <Empty description="Product not found" />
      </Card>
    );
  }

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Button icon={<ArrowLeftOutlined />}>
        <Link to={`/seller/products/${product.id}`}>Back to detail</Link>
      </Button>

      <Card bordered={false}>
        <Space direction="vertical" size={20} style={{ width: "100%" }}>
          <div>
            <Typography.Title level={3}>Edit product</Typography.Title>
            <Typography.Text type="secondary">
              Update product information and replace product images when needed.
            </Typography.Text>
          </div>

          <Form<UpdateSellerProductRequest> form={form} layout="vertical" onFinish={handleUpdateProduct}>
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: "Please enter product name" }]}
            >
              <Input placeholder="Mechanical Keyboard" />
            </Form.Item>

            <Form.Item label="Description" name="description">
              <Input.TextArea placeholder="Short product description" rows={4} />
            </Form.Item>

            <Form.Item
              label="Price"
              name="price"
              rules={[{ required: true, message: "Please enter price" }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              label="Stock"
              name="stock"
              rules={[{ required: true, message: "Please enter stock" }]}
            >
              <InputNumber min={0} precision={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              label="Category"
              name="categoryId"
              rules={[{ required: true, message: "Please choose a category" }]}
            >
              <Select loading={isCategoriesLoading} options={categoryOptions} placeholder="Select category" />
            </Form.Item>

            <Space>
              <Button htmlType="submit" loading={updateMutation.isPending} type="primary">
                Save changes
              </Button>
              <Button>
                <Link to={`/seller/products/${product.id}`}>Cancel</Link>
              </Button>
            </Space>
          </Form>

          <div>
            <Typography.Title level={4}>Current images</Typography.Title>
            {product.images.length === 0 ? (
              <Empty description="No product images" />
            ) : (
              <Row gutter={[16, 16]}>
                {product.images.map((image) => (
                  <Col key={image.id} lg={6} md={8} sm={12} xs={24}>
                    <Image
                      alt={product.name}
                      className="seller-product-detail-image"
                      preview={false}
                      src={image.imageUrl}
                    />
                  </Col>
                ))}
              </Row>
            )}
          </div>

          <Card title="Replace images" type="inner">
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <Typography.Text type="secondary">
                This action replaces all current images with the selected images.
              </Typography.Text>

              <Form<ReplaceImagesFormValues>
                form={imageForm}
                layout="vertical"
                onFinish={handleReplaceImages}
              >
                <Form.Item
                  getValueFromEvent={normalizeUploadFileList}
                  label="New images"
                  name="images"
                  rules={[
                    { required: true, message: "Please upload at least one product image" },
                    {
                      validator: (_, value: UploadFile[] | undefined) => {
                        if (!value || value.length <= MAX_PRODUCT_IMAGES) {
                          return Promise.resolve();
                        }

                        return Promise.reject(new Error(`You can upload up to ${MAX_PRODUCT_IMAGES} images`));
                      },
                    },
                  ]}
                  valuePropName="fileList"
                >
                  <Upload
                    accept="image/jpeg,image/png,image/webp"
                    beforeUpload={handleBeforeUpload}
                    listType="picture-card"
                    maxCount={MAX_PRODUCT_IMAGES}
                    multiple
                    onPreview={handlePreview}
                  >
                    <button className="seller-product-upload-button" type="button">
                      <PlusOutlined />
                      <span>Upload</span>
                    </button>
                  </Upload>
                </Form.Item>

                {previewImage ? (
                  <Image
                    preview={{
                      visible: isPreviewOpen,
                      onVisibleChange: (visible) => setIsPreviewOpen(visible),
                    }}
                    src={previewImage}
                    style={{ display: "none" }}
                  />
                ) : null}

                <Button htmlType="submit" loading={replaceImagesMutation.isPending} type="primary">
                  Replace images
                </Button>
              </Form>
            </Space>
          </Card>
        </Space>
      </Card>
    </Space>
  );
}

export default SellerProductEditPage;
