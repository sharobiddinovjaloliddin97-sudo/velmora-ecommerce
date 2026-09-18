from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from rest_framework import serializers
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode


User = get_user_model()


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )

    def validate(self, attrs):
        email = attrs["email"].strip().lower()
        password = attrs["password"]

        user = authenticate(
            request=self.context.get("request"),
            email=email,
            password=password,
        )

        if user is None:
            raise serializers.ValidationError(
                "Email yoki parol noto'g'ri."
            )

        if not user.is_active:
            raise serializers.ValidationError(
                "Foydalanuvchi faol emas."
            )

        attrs["user"] = user
        return attrs

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
    )

    password_confirm = serializers.CharField(
        write_only=True,
    )

    class Meta:
        model = User

        fields = [
            "id",
            "first_name",
            "email",
            "password",
            "password_confirm",
        ]

        read_only_fields = [
            "id",
        ]

    def validate_email(self, value):
        email = value.strip().lower()

        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError(
                "Bu email allaqachon ro'yxatdan o'tgan."
            )

        return email

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({
                "password_confirm": "Parollar bir xil emas."
            })

        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")

        password = validated_data.pop("password")

        return User.objects.create_user(
            password=password,
            **validated_data,
        )


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User

        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
        ]

        read_only_fields = [
            "id",
        ]

    def validate_email(self, value):
        email = value.strip().lower()

        queryset = User.objects.filter(
            email__iexact=email
        )

        if self.instance:
            queryset = queryset.exclude(
                pk=self.instance.pk
            )

        if queryset.exists():
            raise serializers.ValidationError(
                "Bu email boshqa foydalanuvchiga tegishli."
            )

        return email
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )

    new_password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
        trim_whitespace=False,
    )

    new_password_confirm = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )

    def validate_old_password(self, value):
        user = self.context["request"].user

        if not user.check_password(value):
            raise serializers.ValidationError(
                "Eski parol noto'g'ri."
            )

        return value

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError({
                "new_password_confirm": "Yangi parollar bir xil emas."
            })

        return attrs

    def save(self):
        user = self.context["request"].user

        user.set_password(
            self.validated_data["new_password"]
        )
        user.save()

        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()

    new_password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )

    new_password_confirm = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError({
                "new_password_confirm": "Parollar bir xil emas."
            })


        try:
            user_id = force_str(
                urlsafe_base64_decode(
                    attrs["uid"]
                )
            )



            user = User.objects.get(
                pk=user_id,
                is_active=True,
            )


        except (
            TypeError,
            ValueError,
            OverflowError,
            User.DoesNotExist,
        ) as error:


            raise serializers.ValidationError(
                "Password reset havolasi yaroqsiz."
            )


        if not default_token_generator.check_token(
            user,
            attrs["token"],
        ):

            raise serializers.ValidationError(
                "Password reset havolasi yaroqsiz yoki muddati tugagan."
            )


        validate_password(
            attrs["new_password"],
            user=user,
        )

        attrs["user"] = user

        return attrs


    def save(self):
        user = self.validated_data["user"]

        user.set_password(
            self.validated_data[
                "new_password"
            ]
        )

        user.save()

        return user