import type { CreateSellerProductRequest } from "@market-place/shared/api";
import type { UploadFile } from "antd";
import { App, Button, Card, Form, Image, Input, InputNumber, Select, Space, Typography, Upload } from "antd";
import { ArrowLeftOutlined, PlusOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";

import { useCreateSellerProductMutation } from "@/hooks/useSellerProducts";
import { useCategoriesQuery } from "@/hooks/useSystem";

type CreateSellerProductFormValues = CreateSellerProductRequest & {
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

function buildCreateProductFormData(values: CreateSellerProductFormValues) {
  const formData = new FormData();

  formData.append("name", values.name);
  formData.append("description", values.description ?? "");
  formData.append("price", String(values.price));
  formData.append("stock", String(values.stock));
  formData.append("categoryId", values.categoryId);

  values.images?.forEach((file) => {
    if (file.originFileObj) {
      formData.append("images", file.originFileObj);
    }
  });

  return formData;
}

function SellerProductCreatePage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { data: categoryResponse, isLoading: isCategoriesLoading } = useCategoriesQuery();
  const createMutation = useCreateSellerProductMutation();
  const [form] = Form.useForm<CreateSellerProductFormValues>();
  const [previewImage, setPreviewImage] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const categoryOptions = useMemo(
    () =>
      (categoryResponse?.data ?? []).map((category) => ({
        label: category.name,
        value: category.id,
      })),
    [categoryResponse?.data],
  );

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

  const handleCreateProduct = async (values: CreateSellerProductFormValues) => {
    try {
      const response = await createMutation.mutateAsync(buildCreateProductFormData(values));
      await message.success(response.message);
      navigate("/seller/products");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create product";
      void message.error(errorMessage);
    }
  };

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview && file.originFileObj) {
      file.preview = await getFilePreview(file.originFileObj);
    }

    setPreviewImage(file.url ?? file.preview ?? "");
    setIsPreviewOpen(true);
  };

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Button icon={<ArrowLeftOutlined />}>
        <Link to="/seller/products">Back to products</Link>
      </Button>

      <Card bordered={false}>
        <Space direction="vertical" size={20} style={{ width: "100%" }}>
          <div>
            <Typography.Title level={3}>Add product</Typography.Title>
            <Typography.Text type="secondary">
              Upload 1 to 5 product images. Images are sent with the product create request.
            </Typography.Text>
          </div>

          <Form<CreateSellerProductFormValues> form={form} layout="vertical" onFinish={handleCreateProduct}>
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
              initialValue={1}
              label="Price"
              name="price"
              rules={[{ required: true, message: "Please enter price" }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              initialValue={0}
              label="Stock"
              name="stock"
              rules={[{ required: true, message: "Please enter stock" }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              label="Category"
              name="categoryId"
              rules={[{ required: true, message: "Please choose a category" }]}
            >
              <Select loading={isCategoriesLoading} options={categoryOptions} placeholder="Select category" />
            </Form.Item>

            <Form.Item
              getValueFromEvent={normalizeUploadFileList}
              label="Images"
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

            <Space>
              <Button htmlType="submit" loading={createMutation.isPending} type="primary">
                Create product
              </Button>
              <Button>
                <Link to="/seller/products">Cancel</Link>
              </Button>
            </Space>
          </Form>
        </Space>
      </Card>
    </Space>
  );
}

export default SellerProductCreatePage;
